# 📖 Documentação — `PasswordMatchingService`

**Arquivo:** [`PasswordMatchingService.cs`](./PasswordMatchingService.cs)  
**Namespace:** `Totem.Application.Services.PasswordMatchingServices`  
**Camada:** Application (Serviço de Aplicação)

---

## Visão Geral

O `PasswordMatchingService` é o **coração do mecanismo de atribuição de senhas a guichês** no sistema de totem de atendimento. Ele implementa uma lógica de **casamento (matching) em tempo real** entre senhas aguardando atendimento e guichês disponíveis, usando filas em memória organizadas por fila de serviço.

O serviço atua como um **handler de eventos de domínio** (via MediatR), ou seja, ele **não é chamado diretamente** por controllers ou outros serviços. Em vez disso, é ativado automaticamente quando dois eventos específicos são publicados:

| Evento | Quem publica | Significado |
|---|---|---|
| `PasswordCreatedEvent` | Serviço de criação de senha | Um cidadão gerou uma senha no totem |
| `ServiceLocationWaitingPasswordEvent` | `ServiceLocationService` | Um guichê ficou disponível para atender |

---

## Interfaces Implementadas

```csharp
public class PasswordMatchingService :
    BaseService,
    INotificationHandler<PasswordCreatedEvent>,
    INotificationHandler<ServiceLocationWaitingPasswordEvent>,
    IPasswordMatchingService
```

| Interface | Papel |
|---|---|
| `BaseService` | Herança com utilitários de notificação de erros (`Notify`, `Successful`, `Unsuccessful`) |
| `INotificationHandler<PasswordCreatedEvent>` | Escuta o evento de criação de senha via MediatR |
| `INotificationHandler<ServiceLocationWaitingPasswordEvent>` | Escuta o evento de guichê disponível via MediatR |
| `IPasswordMatchingService` | Marcador de interface para injeção de dependência |

---

## Estado Interno (Filas em Memória)

```csharp
private readonly Dictionary<Guid, Queue<Guid>> _waitingPasswords = new();
private readonly Dictionary<Guid, Queue<Guid>> _waitingLocations = new();
```

O serviço mantém **duas estruturas de fila em memória**, indexadas pelo `QueueId` (ID da fila de serviço):

| Campo | Tipo | Descrição |
|---|---|---|
| `_waitingPasswords` | `Dictionary<Guid, Queue<Guid>>` | Senhas aguardando um guichê, por fila |
| `_waitingLocations` | `Dictionary<Guid, Queue<Guid>>` | Guichês aguardando uma senha, por fila |

> [!IMPORTANT]
> Estas estruturas vivem **na memória da aplicação**. Em ambientes com múltiplas instâncias (ex: load balancer), este estado não é compartilhado entre processos — o que pode causar inconsistências. Para cenários distribuídos, seria necessário migrar este estado para um armazenamento externo (ex: Redis).

---

## Dependências Injetadas

| Dependência | Tipo | Papel |
|---|---|---|
| `_repo` | `IPasswordRepository` | Recupera e persiste entidades `Password` do banco de dados |
| `_notifier` | `IRealTimeNotifier` | Envia notificações em tempo real via **SignalR** |
| `_mediator` | `IMediator` | Publica eventos de domínio após o casamento |

---

## Métodos

---

### `private TryMatch(Guid queueId, Guid id, bool isPassword): Task<Result>`

> **Visibilidade:** Privado  
> **Linhas:** [29–66](./PasswordMatchingService.cs#L29-L66)

Método central da classe. Realiza o **casamento entre senhas e guichês** para uma determinada fila de serviço.

#### Parâmetros

| Parâmetro  | Tipo   | Descrição |
|------------|--------|-----------|
| `queueId`  | `Guid` | ID da fila de serviço onde o evento ocorreu |
| `id`       | `Guid` | ID da senha (se `isPassword = true`) ou ID do guichê (se `isPassword = false`) |
| `isPassword` | `bool` | Indica o que está sendo enfileirado: `true` = senha, `false` = guichê |

#### Fluxo de Execução

```
1. Obtém (ou cria) a fila de senhas aguardando para o queueId   → _waitingPasswords
2. Obtém (ou cria) a fila de guichês disponíveis para o queueId → _waitingLocations
3. Enfileira o novo elemento na fila correspondente (senha ou guichê)
4. Enquanto houver TANTO uma senha QUANTO um guichê disponíveis na mesma fila:
   a. Retira (Dequeue) um ID de senha e um ID de guichê
   b. Busca a entidade Password no banco via _repo.GetByIdAsync
   c. Verifica se a senha pode ser reatribuída (CanBeReassigned → !Served)
   d. Chama pwd.AssignToServiceLocation(slId) para vincular a senha ao guichê
   e. Persiste a alteração via _repo.Update + CommitAsync
   f. Publica PasswordServiceLocationChangedHistoryEvent → registra no histórico
   g. Chama _notifier.NotifyPasswordAssignedAsync → envia evento SignalR ao painel
```

#### Diagrama de Fluxo

```
Evento recebido (Senha ou Guichê)
         │
         ▼
 Enfileira na fila correspondente
         │
         ▼
 ┌──────────────────────────────┐
 │  pwQueue.Count > 0           │
 │       AND                    │◄─── loop
 │  slQueue.Count > 0?          │
 └──────────────────────────────┘
         │ Sim
         ▼
 Dequeue: pwdId + slId
         │
         ▼
 GetByIdAsync(pwdId) → pwd
         │
         ▼
 pwd.CanBeReassigned?
   Não → retorna Unsuccessful(PasswordCannotBeTransfered)
   Sim ↓
         ▼
 pwd.AssignToServiceLocation(slId)
 _repo.Update(pwd)
 CommitAsync()
         │
         ▼
 Publish(PasswordServiceLocationChangedHistoryEvent)
         │
         ▼
 NotifyPasswordAssignedAsync(slId, pwd.Code, pwd.CreatedAt)
         │
         └──────────────────────────► (volta ao loop)
```

#### Retorno

| Resultado | Condição |
|---|---|
| `Successful()` | Casamento realizado com sucesso (ou nenhum casamento necessário) |
| `Unsuccessful(PasswordCannotBeTransfered)` | A senha já foi atendida e não pode ser reatribuída |

---

### `public Handle(PasswordCreatedEvent evt, CancellationToken _): Task`

> **Visibilidade:** Público (handler MediatR)  
> **Linha:** [68–69](./PasswordMatchingService.cs#L68-L69)

Handler ativado automaticamente pelo MediatR quando uma nova senha é criada no totem.

#### Evento recebido: `PasswordCreatedEvent`

```csharp
public record PasswordCreatedEvent(Guid PasswordId, Guid QueueId) : INotification;
```

| Campo | Tipo | Descrição |
|---|---|---|
| `PasswordId` | `Guid` | ID da senha recém-criada |
| `QueueId` | `Guid` | ID da fila à qual a senha pertence |

#### Comportamento

Delega para `TryMatch(evt.QueueId, evt.PasswordId, isPassword: true)`, informando que uma **senha** está aguardando um guichê.

**Cenário típico:**
1. Cidadão seleciona um serviço no totem físico → senha criada.
2. `PasswordCreatedEvent` é publicado pelo serviço de senha.
3. Este handler enfileira a senha em `_waitingPasswords[queueId]`.
4. Se já houver um guichê aguardando nessa fila, o casamento ocorre imediatamente.
5. O painel do atendente recebe a notificação SignalR com o código da senha.

---

### `public Handle(ServiceLocationWaitingPasswordEvent evt, CancellationToken _): Task`

> **Visibilidade:** Público (handler MediatR)  
> **Linha:** [71–72](./PasswordMatchingService.cs#L71-L72)

Handler ativado automaticamente pelo MediatR quando um guichê sinaliza que está disponível para atender.

#### Evento recebido: `ServiceLocationWaitingPasswordEvent`

```csharp
public record ServiceLocationWaitingPasswordEvent(
    Guid ServiceLocationId,
    Guid QueueId
) : INotification;
```

| Campo | Tipo | Descrição |
|---|---|---|
| `ServiceLocationId` | `Guid` | ID do guichê que ficou disponível |
| `QueueId` | `Guid` | ID da fila da qual o guichê quer atender |

#### Comportamento

Delega para `TryMatch(evt.QueueId, evt.ServiceLocationId, isPassword: false)`, informando que um **guichê** está aguardando uma senha.

**Cenário típico:**
1. Atendente clica em "Próximo" no painel web → `ServiceLocationService.ServiceLocationReadyAsync` é chamado.
2. `ServiceLocationWaitingPasswordEvent` é publicado.
3. Este handler enfileira o guichê em `_waitingLocations[queueId]`.
4. Se já houver uma senha aguardando nessa fila, o casamento ocorre imediatamente.
5. A senha é atribuída ao guichê e o painel recebe a notificação SignalR.

---

## Classe Auxiliar — `DictExtensions`

**Arquivo:** [`PasswordMatchingService.cs`](./PasswordMatchingService.cs#L75-L86) (classe estática interna)

Extensão para `Dictionary<K, Queue<T>>` que implementa o padrão **GetOrAdd**: retorna a fila existente ou cria uma nova caso não exista.

### `GetOrAdd<K, T>(this Dictionary<K, Queue<T>> dict, K key): Queue<T>`

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `dict` | `Dictionary<K, Queue<T>>` | O dicionário de filas |
| `key` | `K` | A chave a ser buscada/criada |

**Retorno:** A fila (`Queue<T>`) associada à chave. Se não existir, cria e armazena uma nova fila vazia.

**Uso interno:** Chamado duas vezes no início de `TryMatch` para garantir que tanto `_waitingPasswords[queueId]` quanto `_waitingLocations[queueId]` existam antes de enfileirar o novo elemento.

---

## Efeitos Colaterais do Casamento

Quando um casamento é bem-sucedido, **duas ações adicionais** são disparadas:

### 1. Publicação de histórico via MediatR

```csharp
await _mediator.Publish(new PasswordServiceLocationChangedHistoryEvent(
    pwd.Id,
    oldServiceLocationId,
    slId,
    oldServiceLocationName,
    pwd.ServiceLocation.Name,
    pwd.Code
));
```

Este evento é tratado por `PasswordServiceLocationChangedHistoryEventHandler`, que persiste um registro no histórico da senha com:
- O código da senha
- O local de origem (guichê anterior, se houver)
- O local de destino (novo guichê)
- O tipo de evento: `PasswordHistoryEventType.Transferred`

### 2. Notificação SignalR em tempo real

```csharp
await _notifier.NotifyPasswordAssignedAsync(slId, pwd.Code, pwd.CreatedAt);
```

Dispara uma mensagem via **SignalR** ao painel web, notificando que a senha foi atribuída ao guichê `slId`. O frontend (`useSignalR` / `onNewPasswordAssigned`) recebe este evento e atualiza a interface em tempo real.

---

## Entidade de Domínio — `Password`

O `TryMatch` opera diretamente sobre a entidade [`Password`](../../Domain/Aggregates/PasswordAggregate/Password.cs), utilizando os seguintes membros:

| Membro | Tipo | Descrição |
|---|---|---|
| `CanBeReassigned` | `bool` (calculado) | `true` se `!Served`. Guard que impede reatribuição de senhas já atendidas |
| `AssignToServiceLocation(Guid)` | Método | Vincula a senha ao guichê e registra `AssignedAt = DateTime.UtcNow` |
| `ServiceLocationId` | `Guid?` | ID do guichê ao qual a senha está atribuída |
| `ServiceLocation.Name` | `string` | Nome do guichê (usado no histórico) |
| `Code` | `int` | Código numérico exibido no painel |
| `CreatedAt` | `DateTime` | Data/hora de criação (enviada na notificação SignalR) |

---

## Ciclo de Vida Completo — Exemplo de Uso

```
[Totem físico]
    └─► Cidadão seleciona "Caixa"
            └─► PasswordService.AddAsync(QueueId: "caixa-guid")
                    └─► Cria Password no banco
                    └─► Publica PasswordCreatedEvent(PasswordId, QueueId: "caixa-guid")
                            └─► [MediatR] PasswordMatchingService.Handle(PasswordCreatedEvent)
                                    └─► TryMatch(queueId: "caixa-guid", id: passwordId, isPassword: true)
                                            └─► _waitingPasswords["caixa-guid"].Enqueue(passwordId)
                                            └─► Tem guichê esperando? NÃO → aguarda

[Painel Web — Atendente do Caixa 01]
    └─► Clica em "Próximo"
            └─► ServiceLocationService.ServiceLocationReadyAsync(serviceLocationId: "caixa01-guid", QueueId: "caixa-guid")
                    └─► Publica ServiceLocationWaitingPasswordEvent(ServiceLocationId, QueueId: "caixa-guid")
                            └─► [MediatR] PasswordMatchingService.Handle(ServiceLocationWaitingPasswordEvent)
                                    └─► TryMatch(queueId: "caixa-guid", id: "caixa01-guid", isPassword: false)
                                            └─► _waitingLocations["caixa-guid"].Enqueue("caixa01-guid")
                                            └─► Tem senha esperando? SIM → MATCH!
                                                    ├─► pwd.AssignToServiceLocation("caixa01-guid")
                                                    ├─► CommitAsync()
                                                    ├─► Publish(PasswordServiceLocationChangedHistoryEvent) → histórico salvo
                                                    └─► NotifyPasswordAssignedAsync("caixa01-guid", code: 42, createdAt)
                                                                └─► [SignalR] Painel web atualiza: "Senha 42 — Caixa 01"
```

---

> [!NOTE]
> O `PasswordMatchingService` é registrado como **Singleton** no contêiner de DI para que o estado das filas em memória (`_waitingPasswords` e `_waitingLocations`) persista entre requisições. Caso seja registrado como `Scoped` ou `Transient`, o estado seria perdido a cada requisição, quebrando a lógica de fila.
