# Validação no Totem

As regras de negócio ficam em **Contracts** (`src/Shared/Totem.Common/Validation`), no padrão de notificações: cada regra que falha vira uma mensagem, e o service devolve todas juntas em vez de parar na primeira.

Exemplo completo: [`ServiceTypeValidation.cs`](../src/Services/Totem.Domain/Aggregates/ServiceTypeAggregate/ServiceTypeValidation.cs), usado por [`ServiceType.cs`](../src/Services/Totem.Domain/Aggregates/ServiceTypeAggregate/ServiceType.cs) e [`ServiceTypeService.cs`](../src/Services/Totem.Application/Services/ServiceTypeServices/ServiceTypeService.cs).

## Onde fica cada regra

| Tipo de regra | Onde fica |
|---|---|
| Formato, tamanho, obrigatório (dados de criação) | `XConstructorValidation` (estática, devolve `Contract`) |
| Depende do estado da entidade (já atendida, pode transferir...) | `XValidation.AllowedX`, acessado por `entidade.Validations` |
| Depende do banco (duplicidade, registro existe) | no service, antes de criar ou alterar |
| Entrada sem entidade (papéis, permissões) | Contract estático no service, ex.: `IdentityRequestValidation` |
| JSON malformado e atributos dos DTOs | `ModelStateValidationFilter` |

## O que cada status HTTP significa

- **400:** entrada inválida. Vem do filtro (binding e atributos) ou de um Contract no service, no formato `{ success: false, errors: [...] }`.
- **409:** `DomainException`. Uma guarda da entidade barrou algo que o service deixou passar. É **bug no service**: a regra deveria ter sido checada antes e devolvida como 400.
- **500:** qualquer outra falha. Erro de validação nunca deve chegar aqui.

## Fluxo no service

```csharp
// criação: a entidade ainda não existe, usa a validação estática
var contract = QueueConstructorValidation.AllowedAdd(request.Name);
if (!contract.IsValid)
    return Unsuccessful<Guid>(contract);

// alteração: valida pela entidade carregada
if (!queue.Validations.AllowedUpdate(request.Name))
    return Unsuccessful(queue);
```

As regras de banco vêm **depois** das de memória, para não consultar o banco com uma entrada que já é inválida.

## Checklist de entidade nova

1. Constantes de tamanho na entidade (`public const int NameMaxLength = 100;`), e o mapping do EF usando essas constantes.
2. `XValidation.cs` na pasta do agregado, com `XConstructorValidation` (estática) e `XValidation(X x)` (métodos `AllowedX` que fazem `x.Requires()...Apply(); return x.IsValid;`).
3. Na entidade, a propriedade `[NotMapped, JsonIgnore] public XValidation Validations => _validations ??= new(this);`.
4. Construtor `protected` sem parâmetros, para o EF não materializar pelo construtor com guarda.
5. Guarda em todo método que muda estado: `if (!IsValid || !Validations.AllowedX(...)) throw new DomainException(Errors.UnableX);`.
6. Service valida antes de criar ou alterar e devolve `Unsuccessful(contract | entidade)`.
7. Testes no formato de `tests/Totem.UnitTests/Domain/ServiceTypeValidationTests.cs`: válido passa, cada inválido com a mensagem exata, guarda lança `DomainException` sem alterar a entidade.
8. `dotnet ef migrations has-pending-model-changes` sem pendências (`Notifications` e `Validations` não podem virar coluna).

## ValidationComposer

`new Contract().Requires()` abre a cadeia; nada é gravado até o `Apply()`.

| Método | Falha quando |
|---|---|
| `IsTrue(cond, msg)` / `IsFalse(cond, msg)` | a condição não é a esperada |
| `IsNotNullOrEmpty(string, msg)` | null, vazio ou só espaços |
| `IsNotEmpty(Guid, msg)` | `Guid.Empty` |
| `HasMaxLength(string, max, msg)` | maior que `max` (null passa) |
| `HasLengthBetween(string, min, max, msg)` | fora do intervalo (null falha) |
| `IsValid(contract)` | o outro Contract tem notificações (copia as mensagens dele) |

Modificadores, aplicados à regra anterior:

- `AddLabelArgument(Labels.X)` e `AddArguments(...)` preenchem os `{0}`, `{1}`... da mensagem. Recebe o valor (`Labels.Title`), não lambda: as propriedades do `Labels` são estáticas, e `l => l.Title` não compila (CS0176).
- `StopOnFailure()` ignora o resto da cadeia se a regra anterior falhou. Use quando a regra seguinte não faz sentido sem a anterior (ex.: arquivo grande demais, nem checa o tipo).
- `When(cond, c => c.Regra(...))` aplica o bloco só se a condição for verdadeira. O bloco é uma lambda, então as expressões dentro dele só são calculadas quando a condição vale.

**Cuidado:** fora do `When`, as regras recebem valores, então toda expressão é calculada na hora, mesmo depois de um `StopOnFailure` que já falhou. Proteja o null na própria expressão:

```csharp
.IsTrue(roles is null || roles.All(r => Enum.IsDefined(r)), Errors.InvalidRole)
```

## Mensagens

- Use as chaves genéricas com o rótulo do campo: `Errors.RequiredField` ("{0} é obrigatório."), `Errors.MaxLengthField`, `Errors.LengthBetweenField`, com `AddLabelArgument(Labels.X)`.
- Chave nova vai no `.resx` e, à mão, como propriedade no `Designer.cs` correspondente: o `Designer.cs` não é gerado no build. Chave que já existe no `.resx` pode faltar no `Designer.cs`; nesse caso basta expor a propriedade.
- Depois, rode `node ../Shared/Frontend/Localization/generate-locales.cjs` a partir de `src/Web` para atualizar os `keys.ts` do Web e do Mobile.
- Só existe `pt-BR`.
