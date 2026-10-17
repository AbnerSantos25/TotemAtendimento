# 📖 Documentação — `PasswordMatchingService`

**Arquivo:** [`PasswordMatchingService.cs`](./PasswordMatchingService.cs)
**Namespace:** `Totem.Application.Services.PasswordMatchingServices`
**Camada:** Application (Serviço de Aplicação)

---

## Visão Geral

O `PasswordMatchingService` casa **senhas recém-criadas** com **guichês que pediram atendimento e não tinham senha disponível** no momento do pedido.

Ele é um **handler de eventos de domínio** (MediatR): não é chamado por controllers, e sim ativado quando um destes eventos é publicado.

| Evento | Quem publica | Significado |
|---|---|---|
| `ServiceLocationWaitingPasswordEvent` | `PasswordService.ServiceLocationWaitingPasswordAsync` | Um guichê pediu senha e **a fila estava vazia** |
| `PasswordCreatedEvent` | `PasswordService.AddPasswordAsync` | Um cidadão gerou uma senha no totem |

---

## Por que só os guichês ficam em memória

O ponto central do desenho: **não é preciso rastrear senhas em espera.**

`ServiceLocationWaitingPasswordAsync` só publica `ServiceLocationWaitingPasswordEvent` quando `GetNextUnassignedPasswordFromQueueAsync` não devolve nada. Ou seja, o evento já significa "esta fila está vazia agora". Se houvesse senha disponível, o próprio serviço a teria atribuído na hora, sem passar por aqui.

Então o único estado efêmero que o sistema precisa guardar é: **quais guichês estão parados esperando, e em qual fila.** As senhas já estão persistidas no banco.

```
Guichê pede senha ─┬─ fila tem senha  → atribui na hora (PasswordService)
                   └─ fila vazia      → publica evento → guichê entra na espera (aqui)

Senha criada ──────┬─ ninguém esperando → nada a fazer
                   └─ guichê esperando  → atribui, grava e publica PasswordCalledEvent
```

---

## Estado: `IWaitingServiceLocationStore` (Singleton)

```csharp
services.AddSingleton<IWaitingServiceLocationStore, WaitingServiceLocationStore>();
```

> ⚠️ **O estado não pode viver no handler.** O MediatR cria uma instância nova do handler a cada evento publicado. Guardar as filas em campo de instância — como a implementação original fazia — significa que o guichê registrado num evento nunca é encontrado no evento seguinte, e o casamento **nunca acontece**.

Por isso a espera fica em um serviço **Singleton** separado, enquanto o handler continua com tempo de vida curto e pode injetar repositórios `Scoped`.

`WaitingServiceLocationStore` é protegido por `lock`, já que é compartilhado entre requisições concorrentes, e ignora duplicatas: um guichê que pede senha duas vezes seguidas ocupa **um** lugar na espera, não dois.

| Método | Comportamento |
|---|---|
| `Enqueue(queueId, serviceLocationId)` | Coloca no fim da espera daquela fila; ignora se já estiver lá |
| `TryDequeue(queueId, out serviceLocationId)` | Retira o guichê que espera há mais tempo (FIFO) |
| `Remove(queueId, serviceLocationId)` | Tira o guichê da espera de uma fila especifica |
| `RemoveServiceLocation(serviceLocationId)` | Tira o guichê de qualquer fila em que esteja esperando; chamado por `ServiceLocationService.DeleteAsync` quando o guichê é excluído |
| `ClearQueue(queueId)` | Esvazia a espera inteira de uma fila; chamado por `QueueService.DeleteAsync` e por `QueueService.ToggleStatusQueue` (quando desativa) |

---

## Dependências Injetadas

| Dependência | Uso |
|---|---|
| `INotificator` | Exigida pelo `BaseService` |
| `IPasswordRepository` | Carregar a senha e persistir a atribuição |
| `IServiceLocationRepository` | Obter o nome do guichê para o `PasswordCalledEvent` |
| `IWaitingServiceLocationStore` | Espera compartilhada entre requisições |
| `IMediator` | Publicar `PasswordCalledEvent` após o casamento |

---

## Métodos

### `Handle(ServiceLocationWaitingPasswordEvent, CancellationToken): Task`

Registra o guichê na espera da fila informada. Síncrono na prática — retorna `Task.CompletedTask`.

### `Handle(PasswordCreatedEvent, CancellationToken): Task`

1. `TryDequeue` na fila da senha. **Sem guichê esperando, encerra sem efeito.**
2. Carrega a senha; sai se ela não existir ou se `CanBeReassigned` for `false` (já atendida).
3. Carrega o guichê; sai se ele não existir mais.
4. `AssignToServiceLocation` + `Update` + `CommitAsync`.
5. **Se o commit falhar, devolve o guichê à espera** para que ele não perca a vez.
6. Publica `PasswordCalledEvent`.

Como a senha acabou de ser criada, ela nunca teve guichê anterior: `OldServiceLocationId` vai como `null` e `OldServiceLocationName` como `Labels.NoServiceLocation`.

---

## Efeitos Colaterais do Casamento

O `PasswordCalledEvent` publicado no passo 6 é consumido por handlers independentes:

| Handler | Efeito |
|---|---|
| `PasswordCalledHistoryHandler` | Grava o histórico da chamada |
| `PasswordCalledNotificationHandler` | Notifica os clientes via SignalR |

Nenhum deles realimenta o `PasswordMatchingService`, então não há risco de laço entre eventos.

---

## Testes

[`tests/Totem.UnitTests/Services/PasswordMatchingServiceTests.cs`](../../../../../tests/Totem.UnitTests/Services/PasswordMatchingServiceTests.cs) exercita o fluxo **entre duas instâncias diferentes do handler**, compartilhando um único store — exatamente o cenário em que a implementação anterior falhava silenciosamente.

Casos cobertos: guichê em espera recebe a senha; sem guichê esperando nada acontece; espera de outra fila não recebe; falha de commit devolve o guichê à espera; senha já atendida não é reatribuída.

[`WaitingServiceLocationStoreTests.cs`](../../../../../tests/Totem.UnitTests/Services/WaitingServiceLocationStoreTests.cs) cobre a ordem FIFO, a deduplicação e o isolamento entre filas.

---

## Limitação conhecida

A espera é **em memória**: reiniciar a aplicação esvazia a lista de guichês aguardando, e o desenho não funciona com múltiplas instâncias da API (cada uma teria a sua própria espera). Para rodar com mais de uma instância, este estado precisa migrar para um armazenamento compartilhado — banco ou cache distribuído.
