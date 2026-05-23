# Permissionamento de Filas por Usuário — Plano de Implementação

## Contexto

Hoje qualquer usuário logado (Role `User`, `Manager` ou `Admin`) consegue selecionar **qualquer fila** na tela Meu Guichê. A recepcionista pode acessar a fila de Radiologia, o que não deveria ser permitido.

### O que existe hoje
- **Roles** (`Admin`, `Manager`, `User`) — controlam acesso a **funcionalidades** (painel admin vs. guichê)
- **Nenhuma** restrição sobre **quais filas** cada usuário pode atender

### O que precisa existir
- Tabela `UserQueuePermission` — define **quais filas** cada usuário pode ver/atender
- `Admin` e `Manager` **ignoram** a restrição (acesso total)
- `User` é **filtrado** pelas permissões configuradas pelo Manager

### Decisão de design: por que tabela e não Claims?
- Claims vivem no JWT e exigem re-login para atualizar
- O Manager precisa configurar permissões em runtime sem que o User precise deslogar
- Tabela é consultada em tempo real e não infla o token

---

## Arquitetura da Solução

```
┌──────────────────┐     ┌──────────────────────────┐     ┌──────────┐
│  AppIdentityDb   │     │    UserQueuePermission    │     │ TotemDb  │
│  (schema Identity)│     │  (schema Identity)       │     │ (schema  │
│                  │     │                          │     │  Totem)  │
│  SysUser ────────│────►│  UserId (FK SysUser.Id)  │     │          │
│                  │     │  QueueId (FK Queue.Id) ──│────►│  Queue   │
└──────────────────┘     └──────────────────────────┘     └──────────┘
```

> [!IMPORTANT]
> **Decisão necessária:** A tabela `UserQueuePermission` precisa referenciar tanto `SysUser` (schema Identity) quanto `Queue` (schema Totem). Duas opções:
> 1. **Colocar no `AppIdentityDbContext`** com FK para o schema `Totem.Queue` — a migration ficaria no Identity, mas com cross-schema FK
> 2. **Criar um DbContext intermediário** ou colocar no `TotemDbContext` — mais limpo mas a tabela ficaria separada do Identity
>
> **Recomendação:** opção 1 — a tabela pertence logicamente ao domínio de permissões do usuário, então faz sentido estar junto do Identity.

---

## Checklist de Implementação

### Parte 1 — Backend: Entidade e Persistência
> Objetivo: criar a tabela `UserQueuePermission` no banco de dados.

- [ ] **1.1** Criar entidade `UserQueuePermission.cs` no `UserAggregate`:
  ```csharp
  public class UserQueuePermission
  {
      public Guid UserId { get; private set; }
      public Guid QueueId { get; private set; }

      public UserQueuePermission(Guid userId, Guid queueId)
      {
          UserId = userId;
          QueueId = queueId;
      }
  }
  ```

- [ ] **1.2** Configurar o mapping no `AppIdentityDbContext.OnModelCreating`:
  ```csharp
  modelBuilder.Entity<UserQueuePermission>(b =>
  {
      b.ToTable("SysUserQueuePermissions");
      b.HasKey(x => new { x.UserId, x.QueueId });
      b.HasOne<User>().WithMany().HasForeignKey(x => x.UserId);
      // QueueId é FK cross-schema — sem navigation property
  });
  ```

- [ ] **1.3** Adicionar `DbSet<UserQueuePermission>` no `AppIdentityDbContext`

- [ ] **1.4** Gerar a migration EF Core (`dotnet ef migrations add AddUserQueuePermission`)

---

### Parte 2 — Backend: Repository e Queries
> Objetivo: fornecer métodos para ler e gravar permissões de fila.

- [ ] **2.1** Criar interface `IUserQueuePermissionRepository.cs`:
  ```csharp
  public interface IUserQueuePermissionRepository
  {
      Task<List<Guid>> GetAllowedQueueIdsAsync(Guid userId);
      Task<bool> HasPermissionAsync(Guid userId, Guid queueId);
      Task SetPermissionsAsync(Guid userId, List<Guid> queueIds);
  }
  ```

- [ ] **2.2** Implementar `UserQueuePermissionRepository.cs`:
  - `GetAllowedQueueIdsAsync` — `SELECT QueueId WHERE UserId = @userId`
  - `HasPermissionAsync` — `Any(x => x.UserId == userId && x.QueueId == queueId)`
  - `SetPermissionsAsync` — remove as existentes, insere as novas (replace completo)

- [ ] **2.3** Registrar no DI (`DependencyInjection.cs`):
  ```csharp
  services.AddScoped<IUserQueuePermissionRepository, UserQueuePermissionRepository>();
  ```

---

### Parte 3 — Backend: Service e Controller
> Objetivo: endpoints para o Manager configurar e para o User consultar suas filas permitidas.

- [ ] **3.1** Criar `IUserQueuePermissionService.cs`:
  ```csharp
  public interface IUserQueuePermissionService
  {
      Task<(Result result, List<Guid> data)> GetAllowedQueueIdsAsync(Guid userId);
      Task<Result> SetPermissionsAsync(Guid userId, List<Guid> queueIds);
  }
  ```

- [ ] **3.2** Implementar `UserQueuePermissionService.cs`:
  - `GetAllowedQueueIdsAsync` — delega para o repository
  - `SetPermissionsAsync` — valida se os queueIds existem, depois salva

- [ ] **3.3** Registrar no DI:
  ```csharp
  services.AddScoped<IUserQueuePermissionService, UserQueuePermissionService>();
  ```

- [ ] **3.4** Criar request model `SetUserQueuePermissionsRequest.cs`:
  ```csharp
  public class SetUserQueuePermissionsRequest
  {
      public List<Guid> QueueIds { get; set; } = new();
  }
  ```

- [ ] **3.5** Adicionar endpoints no `IdentityController.cs`:
  ```csharp
  // Manager/Admin configura quais filas o usuário pode atender
  [Authorize(Roles = "Admin,Manager")]
  [HttpGet("user/{userId}/queue-permissions")]
  public async Task<ActionResult> GetUserQueuePermissions(Guid userId)

  [Authorize(Roles = "Admin,Manager")]
  [HttpPut("user/{userId}/queue-permissions")]
  public async Task<ActionResult> SetUserQueuePermissions(
      Guid userId, [FromBody] SetUserQueuePermissionsRequest request)
  ```

---

### Parte 4 — Backend: Filtro de Filas no QueueService
> Objetivo: o `GET /queues` retornar apenas filas permitidas quando o caller for `User`.

- [ ] **4.1** Alterar `IQueueServices.cs` — adicionar overload com userId/roles:
  ```csharp
  Task<(Result result, List<QueueSummary> data)> GetListByPermissionAsync(
      Guid userId, bool isAdminOrManager);
  ```

- [ ] **4.2** Implementar `GetListByPermissionAsync` no `QueueService.cs`:
  - Se `isAdminOrManager` → retorna `GetListAsync()` (todas)
  - Se não → busca `GetAllowedQueueIdsAsync(userId)` e filtra

- [ ] **4.3** Alterar `QueueController.GetListAsync` para extrair o userId do token e passar o contexto:
  ```csharp
  [HttpGet]
  [Authorize]
  public async Task<IActionResult> GetListAsync()
  {
      var userId = GetUserId(); // do JWT claim
      var isAdminOrManager = User.IsInRole("Admin") || User.IsInRole("Manager");
      return CustomResponse(await _queueServices.GetListByPermissionAsync(userId, isAdminOrManager));
  }
  ```

---

### Parte 5 — Frontend: Services e Models
> Objetivo: API client e types para gerenciar permissões de fila.

- [ ] **5.1** Criar interface `UserQueuePermission` em `UserModels.ts`:
  ```typescript
  export interface UserQueuePermissionRequest {
      queueIds: string[];
  }
  ```

- [ ] **5.2** Adicionar métodos ao `UserService.ts`:
  ```typescript
  getUserQueuePermissionsAsync(userId: string): Promise<ServiceResult<string[]>>
  setUserQueuePermissionsAsync(userId: string, queueIds: string[]): Promise<ServiceResult<void>>
  ```

- [ ] **5.3** Atualizar `IUserService.ts` com as novas assinaturas

---

### Parte 6 — Frontend: UI de Configuração
> Objetivo: o Manager configura as filas de cada usuário na tela de Gestão de Usuários.

- [ ] **6.1** `UserConfiguration.tsx` — adicionar botão de ação "Configurar Filas" na tabela (ícone `ListChecks`)

- [ ] **6.2** `UserConfiguration.tsx` — criar estado para o dialog de permissões:
  ```tsx
  const [userToConfigQueues, setUserToConfigQueues] = useState<UserSummary | null>(null);
  const [availableQueues, setAvailableQueues] = useState<QueueView[]>([]);
  const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>([]);
  ```

- [ ] **6.3** `UserConfiguration.tsx` — ao abrir o dialog, carregar:
  - Todas as filas disponíveis (`queueService.getAllQueuesAsync()`)
  - Permissões atuais do usuário (`userService.getUserQueuePermissionsAsync(userId)`)

- [ ] **6.4** `UserConfiguration.tsx` — criar `Dialog` com lista de checkboxes de filas:
  ```
  ┌──────────────────────────────────────┐
  │  Configurar Filas de Acesso          │
  │  Selecione as filas que "Maria"      │
  │  poderá atender no guichê.           │
  │                                      │
  │  ☑ Recepção                          │
  │  ☐ Radiologia                        │
  │  ☐ Raio-X                            │
  │                                      │
  │           [Cancelar] [Salvar]         │
  └──────────────────────────────────────┘
  ```

- [ ] **6.5** `UserConfiguration.tsx` — handler `handleSaveQueuePermissions`:
  - Chama `userService.setUserQueuePermissionsAsync(userId, selectedQueueIds)`
  - Toast de sucesso/erro

- [ ] **6.6** `MeuGuiche.tsx` — **nenhuma mudança necessária**
  O `GET /queues` já vai retornar apenas as filas permitidas (filtro no backend). O dropdown de filas do MeuGuiche automaticamente mostrará somente as filas que o usuário pode atender.

---

## Cenário de Verificação

1. **Manager** abre Gestão de Usuários → clica "Configurar Filas" na Maria
2. Marca apenas "Recepção" → Salvar → `PUT /user/{id}/queue-permissions` com `["queue-recepcao-id"]`
3. **Maria** (Role: User) abre Meu Guichê → `GET /queues` retorna **apenas "Recepção"**
4. Maria **não consegue** ver ou selecionar "Radiologia" ou "Raio-X"
5. **Admin** abre Meu Guichê → `GET /queues` retorna **todas as filas** (bypass da permissão)

---

## Open Questions

> [!IMPORTANT]
> **1. Cross-schema FK:** Confirmar se o banco atual suporta FK do schema `Identity` para o schema `Totem` (ambos estão no mesmo database?). Se estiverem em databases separados, a FK de `QueueId` precisaria ser apenas lógica (sem constraint).

> [!IMPORTANT]
> **2. Usuário sem nenhuma fila:** Se o Manager não configurar nenhuma fila para um User, o que acontece?
> - **Opção A:** O User não vê nenhuma fila no Meu Guichê (tela vazia com mensagem "Solicite acesso ao seu gestor")
> - **Opção B:** O User vê todas as filas por padrão (permissão aberta até ser restringida)
> - **Recomendação:** Opção A — segurança por padrão.

> [!IMPORTANT]
> **3. Coluna "Filas" na tabela de usuários:** Exibir as filas permitidas como badges na tabela de usuários, ou só dentro do dialog?
