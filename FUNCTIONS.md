# 📖 Documentação de Funções — TotemAtendimento

Este documento descreve as principais funções e métodos do projeto **TotemAtendimento**, organizado por camada (Frontend Web, Backend .NET).

---

## Sumário

- [Frontend — Web (TypeScript/React)](#frontend--web-typescriptreact)
  - [BaseService](#baseservice)
  - [StorageService](#storageservice)
  - [AuthService](#authservice)
  - [UserService](#userservice)
  - [QueueService (TS)](#queueservice-ts)
  - [PasswordService (TS)](#passwordservice-ts)
  - [ServiceLocationService (TS)](#servicelocationservice-ts)
  - [ServiceTypeService](#servicetypeservice)
  - [SignalRService](#signalrservice)
  - [Contexto — AuthContext / AuthProvider](#contexto--authcontext--authprovider)
  - [Hooks React](#hooks-react)
- [Backend — .NET (C#)](#backend--net-c)
  - [IdentityService (C#)](#identityservice-c)
  - [QueueService (C#)](#queueservice-c)
  - [ServiceLocationService (C#)](#servicelocationservice-c)

---

## Frontend — Web (TypeScript/React)

---

### BaseService

**Arquivo:** [`src/Web/src/services/BaseService.ts`](./src/Web/src/services/BaseService.ts)

Classe base que encapsula toda a lógica de comunicação HTTP com a API REST. Todos os outros serviços do frontend herdam desta classe. Gerencia autenticação via cookie, proteção CSRF e renovação automática de token JWT.

---

#### `private createApiErrorAsync(response: Response): Promise<ApiError>`

> **Visibilidade:** Privado

Transforma uma `Response` HTTP com falha em um objeto `ApiError` padronizado para o sistema.

**Funcionamento:**
1. Lê o corpo da resposta como texto.
2. Se o status for `>= 500`, retorna mensagem genérica de erro de servidor.
3. Caso contrário, tenta fazer o parse do corpo como JSON para extrair uma mensagem amigável.
4. Suporta os formatos de erro: `errors` (objeto de validação), `errors` (array), `title`, `detail` ou texto puro.

**Retorno:** `ApiError` com `statusCode`, `message`, `body` e, opcionalmente, `validationErrors`.

---

#### `private tryRefreshTokenAsync(): Promise<boolean>`

> **Visibilidade:** Privado

Tenta renovar o JWT realizando uma chamada `POST` ao endpoint `/totem/RefreshToken/refresh` utilizando cookies (`credentials: 'include'`).

**Retorno:**
- `true` — Token renovado com sucesso.
- `false` — Falha ao renovar (token expirado, rede indisponível, etc.).

**Uso interno:** Chamado automaticamente por `_request` quando a API retorna `401 Unauthorized`.

---

#### `private _request<TResponse>(method, endpoint, body?, options?): Promise<ServiceResult<TResponse>>`

> **Visibilidade:** Privado

Método central que executa todas as requisições HTTP. É o coração da `BaseService`.

**Parâmetros:**

| Parâmetro  | Tipo | Descrição |
|------------|------|-----------|
| `method`   | `'GET' \| 'POST' \| 'PUT' \| 'DELETE' \| 'PATCH'` | Verbo HTTP |
| `endpoint` | `string` | Caminho relativo ao `VITE_API_BASE_URL` |
| `body`     | `any` | Corpo da requisição (serializado como JSON) |
| `options`  | `RequestOptions` | Opções adicionais. `requiresAuth` indica se deve tentar refresh em caso de 401. |

**Fluxo:**
1. Monta a URL completa com base na variável de ambiente `VITE_API_BASE_URL`.
2. Para métodos não-GET, injeta o token `XSRF-TOKEN` no header `X-XSRF-TOKEN` (proteção anti-CSRF).
3. Envia a requisição com `credentials: 'include'` para transportar cookies de sessão.
4. Em resposta `401` (se `requiresAuth = true`): tenta `tryRefreshTokenAsync()`.
   - Se renovado: repete a requisição original.
   - Se falhar: limpa a sessão (`clearSessionAsync`) e retorna erro de sessão expirada.
5. Para status `204 No Content`: retorna sucesso sem dados.
6. Para respostas bem-sucedidas com corpo: deserializa o JSON e verifica o campo `success` da API.

**Retorno:** `ServiceResult<TResponse>` com `{ success: true, data }` ou `{ success: false, error }`.

---

#### `public GetAsync<TResponse>(endpoint, requiresAuth?): Promise<ServiceResult<TResponse>>`

Executa uma requisição **GET**.

**Parâmetros:**

| Parâmetro      | Padrão | Descrição |
|----------------|--------|-----------|
| `endpoint`     | —      | Rota da API |
| `requiresAuth` | `true` | Se deve tentar refresh em caso de 401 |

**Exemplo:**
```typescript
const result = await api.GetAsync<User[]>('/totem/Identity/users');
```

---

#### `public PostAsync<TResponse, TRequest>(endpoint, body, requiresAuth?): Promise<ServiceResult<TResponse>>`

Executa uma requisição **POST** com corpo JSON.

**Parâmetros:**

| Parâmetro      | Padrão  | Descrição |
|----------------|---------|-----------|
| `endpoint`     | —       | Rota da API |
| `body`         | —       | Objeto a ser enviado no corpo |
| `requiresAuth` | `false` | Se deve tentar refresh em caso de 401 |

**Exemplo:**
```typescript
const result = await api.PostAsync<AuthResult, LoginRequest>('/totem/identity/login', credentials);
```

---

#### `public PutAsync<TResponse, TRequest>(endpoint, body, requiresAuth?): Promise<ServiceResult<TResponse>>`

Executa uma requisição **PUT** para atualização completa de um recurso.

**Parâmetros:**

| Parâmetro      | Padrão | Descrição |
|----------------|--------|-----------|
| `endpoint`     | —      | Rota da API com ID do recurso |
| `body`         | —      | Objeto com os dados atualizados |
| `requiresAuth` | `true` | Se deve tentar refresh em caso de 401 |

---

#### `public DeleteAsync<TResponse>(endpoint, requiresAuth?): Promise<ServiceResult<TResponse>>`

Executa uma requisição **DELETE**.

**Parâmetros:**

| Parâmetro      | Padrão | Descrição |
|----------------|--------|-----------|
| `endpoint`     | —      | Rota da API com ID do recurso |
| `requiresAuth` | `true` | Se deve tentar refresh em caso de 401 |

---

#### `public PatchAsync<TResponse, TRequest>(endpoint, body?, requiresAuth?): Promise<ServiceResult<TResponse>>`

Executa uma requisição **PATCH** para atualização parcial de um recurso. O corpo é opcional.

**Parâmetros:**

| Parâmetro      | Padrão | Descrição |
|----------------|--------|-----------|
| `endpoint`     | —      | Rota da API |
| `body`         | —      | Dados parciais (opcional) |
| `requiresAuth` | `true` | Se deve tentar refresh em caso de 401 |

---

### StorageService

**Arquivo:** [`src/Web/src/services/StorageService.ts`](./src/Web/src/services/StorageService.ts)

Serviço singleton (`session`) responsável por persistir e recuperar dados de sessão do usuário no `localStorage` do navegador.

**Constantes internas:**

| Chave         | Descrição |
|---------------|-----------|
| `status`      | Status numérico da sessão (`Status.loggedIn` / `Status.loggedOut`) |
| `userView`    | Dados do usuário autenticado serializados em JSON |

---

#### `saveUserAsync(user: UserView): Promise<void>`

Persiste os dados do usuário no `localStorage` e define o status como `loggedIn`.

**Parâmetros:**

| Parâmetro | Tipo       | Descrição |
|-----------|------------|-----------|
| `user`    | `UserView` | Objeto com dados do usuário autenticado |

**Uso:** Chamado após login bem-sucedido para manter a sessão entre recarregamentos da página.

---

#### `saveStatusAsync(status: number): Promise<void>`

Salva o status numérico da sessão no `localStorage`.

**Parâmetros:**

| Parâmetro | Tipo     | Descrição |
|-----------|----------|-----------|
| `status`  | `number` | Valor do enum `Status` (`loggedIn = 1`, `loggedOut = 0`) |

---

#### `getStatusAsync(): Promise<string | null>`

Recupera o status da sessão armazenado no `localStorage`.

**Retorno:** String com o valor do status ou `null` se não existir.

---

#### `clearSessionAsync(): Promise<void>`

Remove os dados do usuário do `localStorage`, define o status como `loggedOut` e despacha o evento global `onSessionExpired` para notificar os componentes React.

**Uso:** Chamado automaticamente pela `BaseService` quando o refresh token falha, ou pelo `AuthContext` no logout.

---

#### `getUserAsync(): Promise<UserView | null>`

Recupera e desserializa os dados do usuário armazenados no `localStorage`.

**Retorno:** Objeto `UserView` ou `null` se não houver sessão salva.

---

### AuthService

**Arquivo:** [`src/Web/src/services/AuthServices/AuthService.ts`](./src/Web/src/services/AuthServices/AuthService.ts)

Serviço de autenticação que encapsula as chamadas à API de identidade.

---

#### `loginAsync(credentials: LoginRequest): Promise<ServiceResult<AuthResult>>`

Autentica um usuário com e-mail e senha via `POST /totem/identity/login`.

**Parâmetros:**

| Parâmetro     | Tipo           | Descrição |
|---------------|----------------|-----------|
| `credentials` | `LoginRequest` | `{ email, password }` |

**Retorno:** `AuthResult` com JWT, refresh token e dados do usuário (`UserView`).

---

#### `logoutAsync(userId: string): Promise<ServiceResult<void>>`

Realiza o logout do usuário, revogando os refresh tokens no servidor via `POST /totem/identity/logout/{userId}`.

**Parâmetros:**

| Parâmetro | Tipo     | Descrição |
|-----------|----------|-----------|
| `userId`  | `string` | ID do usuário a ser desconectado |

---

#### `getMeAsync(): Promise<ServiceResult<UserView>>`

Recupera os dados do usuário autenticado via `GET /totem/identity/me`, usando o cookie de sessão.

**Uso:** Chamado na inicialização do `AuthProvider` para restaurar a sessão do usuário.

**Retorno:** `UserView` com id, nome, e-mail, roles e status.

---

### UserService

**Arquivo:** [`src/Web/src/services/UserService.ts`](./src/Web/src/services/UserService.ts)

Serviço para gerenciamento de usuários do sistema (operações administrativas). Endpoint base: `/totem/Identity`.

---

#### `getListUserAsync(): Promise<ServiceResult<UserSummary[]>>`

Retorna a lista de todos os usuários cadastrados (`GET /totem/Identity/users`).

---

#### `registerUserAsync(request: RegisterUserRequest): Promise<ServiceResult<void>>`

Cadastra um novo usuário no sistema (`POST /totem/Identity/register`).

| Parâmetro | Tipo                  | Descrição |
|-----------|-----------------------|-----------|
| `request` | `RegisterUserRequest` | `{ fullName, email, password }` |

---

#### `inactivateUserAsync(userId: string): Promise<ServiceResult<void>>`

Inativa um usuário, bloqueando seu acesso (`PATCH /totem/Identity/user/{userId}/inactivate`).

---

#### `activateUserAsync(userId: string): Promise<ServiceResult<void>>`

Reativa um usuário previamente inativado (`PATCH /totem/Identity/user/{userId}/active`).

---

#### `assignRoleAsync(request: AssignRoleRequest): Promise<ServiceResult<void>>`

Atribui uma única role a um usuário (`POST /totem/Identity/assign-role`).

---

#### `updateUserRolesAsync(request: UpdateUserRolesRequest): Promise<ServiceResult<void>>`

Atualiza o conjunto completo de roles de um usuário, adicionando as novas e removendo as que não fazem mais parte do conjunto (`POST /totem/Identity/assign-roles`).

---

#### `changePasswordAsync(userId: string, request: ChangePasswordRequest): Promise<ServiceResult<void>>`

Altera a senha de um usuário, exigindo a senha atual para confirmação (`POST /totem/Identity/user/{userId}/change-password`).

| Parâmetro | Tipo                    | Descrição |
|-----------|-------------------------|-----------|
| `userId`  | `string`                | ID do usuário |
| `request` | `ChangePasswordRequest` | `{ oldPassword, newPassword }` |

---

### QueueService (TS)

**Arquivo:** [`src/Web/src/services/QueueService.ts`](./src/Web/src/services/QueueService.ts)

Serviço para gerenciamento de filas de atendimento. Endpoint base: `/totem/Queue`.

---

#### `getAllQueuesAsync(): Promise<ServiceResult<QueueView[]>>`

Retorna todas as filas cadastradas (`GET /totem/Queue`).

---

#### `getQueueByIdAsync(id: string): Promise<ServiceResult<QueueView>>`

Retorna os detalhes de uma fila pelo ID (`GET /totem/Queue/{id}`).

---

#### `createQueueAsync(dto: QueueRequest): Promise<ServiceResult<QueueView>>`

Cria uma nova fila de atendimento (`POST /totem/Queue`).

| Parâmetro | Tipo           | Descrição |
|-----------|----------------|-----------|
| `dto`     | `QueueRequest` | `{ name }` |

---

#### `updateQueueAsync(id: string, dto: QueueRequest): Promise<ServiceResult<QueueView>>`

Atualiza os dados de uma fila existente (`PUT /totem/Queue/{id}`).

---

#### `deleteQueueAsync(id: string): Promise<ServiceResult<void>>`

Remove permanentemente uma fila (`DELETE /totem/Queue/{id}`).

---

#### `toggleQueueStatusAsync(id: string): Promise<ServiceResult<QueueView>>`

Alterna o status ativo/inativo de uma fila (`PATCH /totem/Queue/{id}/toggleQueueStatus`).

---

### PasswordService (TS)

**Arquivo:** [`src/Web/src/services/PasswordService.ts`](./src/Web/src/services/PasswordService.ts)

Serviço para gerenciamento de senhas de atendimento. Endpoint base: `/totem/Password`.

---

#### `getPasswordByIdAsync(id: string): Promise<ServiceResult<PasswordView>>`

Retorna os detalhes de uma senha específica pelo ID (`GET /totem/Password/{id}`).

---

#### `getPasswordsAsync(queueId: string): Promise<ServiceResult<PasswordView[]>>`

Retorna todas as senhas de uma fila específica (`GET /totem/Password?queueId={queueId}`).

---

#### `addPasswordAsync(request: PasswordRequest): Promise<ServiceResult<string>>`

Gera/adiciona uma nova senha na fila (`POST /totem/Password`).

| Parâmetro | Tipo              | Descrição |
|-----------|-------------------|-----------|
| `request` | `PasswordRequest` | Dados da senha a ser criada |

**Retorno:** ID da senha criada.

---

#### `transferPasswordAsync(passwordId: string, request: PasswordTransferRequest): Promise<ServiceResult<void>>`

Transfere uma senha para outra fila (`POST /totem/Password/{passwordId}/transfer`).

---

#### `markAsServedAsync(passwordId: string): Promise<ServiceResult<void>>`

Marca uma senha como atendida, encerrando o atendimento (`PATCH /totem/Password/{passwordId}/MarkAsServed`).

---

#### `removePasswordAsync(id: string): Promise<ServiceResult<void>>`

Remove uma senha da fila (`DELETE /totem/Password/{id}`).

---

### ServiceLocationService (TS)

**Arquivo:** [`src/Web/src/services/ServiceLocationService.ts`](./src/Web/src/services/ServiceLocationService.ts)

Serviço para gerenciamento de locais de atendimento (guichês). Endpoint base: `/totem/ServiceLocation`.

---

#### `getListAsync(): Promise<ServiceResult<ServiceLocationView[]>>`

Retorna todos os locais de atendimento cadastrados (`GET /totem/ServiceLocation`).

---

#### `getByIdAsync(id: string): Promise<ServiceResult<ServiceLocationView>>`

Retorna os detalhes de um local pelo ID (`GET /totem/ServiceLocation/{id}`).

---

#### `addAsync(request: ServiceLocationRequest): Promise<ServiceResult<string>>`

Cadastra um novo local de atendimento (`POST /totem/ServiceLocation`).

| Parâmetro | Tipo                     | Descrição |
|-----------|--------------------------|-----------|
| `request` | `ServiceLocationRequest` | `{ name, number }` |

**Retorno:** ID do local criado.

---

#### `updateAsync(id: string, request: ServiceLocationRequest): Promise<ServiceResult<ServiceLocationView>>`

Atualiza os dados de um local de atendimento (`PUT /totem/ServiceLocation/{id}`).

---

#### `deleteAsync(id: string): Promise<ServiceResult<void>>`

Remove um local de atendimento (`DELETE /totem/ServiceLocation/{id}`).

---

#### `notifyAvailableAsync(id: string, request: ServiceLocationReadyRequest): Promise<ServiceResult<PasswordView>>`

Informa que um guichê está disponível para atender, disparando a chamada da próxima senha da fila (`POST /totem/ServiceLocation/{id}/ready`).

| Parâmetro | Tipo                          | Descrição |
|-----------|-------------------------------|-----------|
| `id`      | `string`                      | ID do local de atendimento |
| `request` | `ServiceLocationReadyRequest` | `{ queueId, name }` — fila e nome do atendente |

**Retorno:** A `PasswordView` da senha chamada.

---

#### `recallCurrentPasswordAsync(id: string): Promise<ServiceResult<void>>`

Relama a senha atual em atendimento no guichê informado, útil para casos em que o cliente não ouviu a chamada (`POST /totem/ServiceLocation/{id}/recall`).

---

### ServiceTypeService

**Arquivo:** [`src/Web/src/services/ServiceTypeService.ts`](./src/Web/src/services/ServiceTypeService.ts)

Serviço para gerenciamento de tipos de serviço. Endpoint base: `/totem/ServiceType`.

---

#### `getByIdAsync(id: string): Promise<ServiceResult<ServiceTypeView>>`

Retorna os detalhes de um tipo de serviço pelo ID (`GET /totem/ServiceType/{id}`).

---

#### `getActiveServicesAsync(): Promise<ServiceResult<ServiceTypeSummary[]>>`

Retorna apenas os tipos de serviço com status ativo (`GET /totem/ServiceType/active`).

**Uso:** Exibido no totem para o cidadão selecionar o tipo de serviço desejado.

---

#### `getAllAsync(): Promise<ServiceResult<ServiceTypeSummary[]>>`

Retorna todos os tipos de serviço, independente do status (`GET /totem/ServiceType`).

---

#### `createAsync(request: ServiceTypeRequest): Promise<ServiceResult<string>>`

Cria um novo tipo de serviço (`POST /totem/ServiceType`).

**Retorno:** ID do tipo de serviço criado.

---

#### `updateAsync(id: string, request: ServiceTypeRequest): Promise<ServiceResult<void>>`

Atualiza os dados de um tipo de serviço (`PUT /totem/ServiceType/{id}`).

---

#### `toggleStatusAsync(id: string): Promise<ServiceResult<void>>`

Alterna o status ativo/inativo de um tipo de serviço (`PATCH /totem/ServiceType/{id}/toggle-status`).

---

#### `disableAsync(id: string): Promise<ServiceResult<void>>`

Desativa um tipo de serviço explicitamente (`PATCH /totem/ServiceType/{id}/disable`).

---

#### `deleteAsync(id: string): Promise<ServiceResult<void>>`

Remove permanentemente um tipo de serviço (`DELETE /totem/ServiceType/{id}`).

---

### SignalRService

**Arquivo:** [`src/Web/src/services/SignalRService.ts`](./src/Web/src/services/SignalRService.ts)

Serviço singleton (`signalRService`) que gerencia a conexão em tempo real com o Hub SignalR (`/passwordHub`). Permite que o painel Web receba notificações ao vivo de eventos de senhas (chamada, atendimento, etc.).

**Estado interno:**

| Campo                      | Descrição |
|----------------------------|-----------|
| `connection`               | Instância ativa do `HubConnection` |
| `currentServiceLocationId` | ID do local de atendimento atualmente inscrito |

---

#### `startAsync(serviceLocationId: string): Promise<void>`

Inicia a conexão SignalR e entra na sala (`group`) do local de atendimento informado.

**Comportamento:**
- Se já conectado ao mesmo `serviceLocationId`, não faz nada (idempotente).
- Se conectado a outro local, desconecta primeiro (`stopAsync`) antes de conectar ao novo.
- Configura reconexão automática com intervalos: `[0, 2s, 5s, 10s, 30s]`.
- Invoca o método `JoinServiceLocation` no Hub para entrar na sala correspondente.

**Parâmetros:**

| Parâmetro           | Tipo     | Descrição |
|---------------------|----------|-----------|
| `serviceLocationId` | `string` | ID do guichê/local a ser monitorado |

---

#### `stopAsync(): Promise<void>`

Encerra a conexão SignalR, invocando `LeaveServiceLocation` no Hub antes de fechar.

**Comportamento:** Limpa `connection` e `currentServiceLocationId` no bloco `finally`, garantindo estado consistente mesmo em caso de erro.

---

#### `onPasswordCalled(callback): void`

Registra um handler para o evento **`PasswordCalled`** — disparado quando uma senha é chamada pela primeira vez.

| Parâmetro  | Tipo | Descrição |
|------------|------|-----------|
| `callback` | `(data: PasswordCalledPayload) => void` | Função executada ao receber o evento |

---

#### `onPasswordRecalled(callback): void`

Registra um handler para o evento **`PasswordRecalled`** — disparado quando uma senha é rechamada (cliente não compareceu).

---

#### `onPasswordServed(callback): void`

Registra um handler para o evento **`PasswordServed`** — disparado quando uma senha é atendida e encerrada.

---

#### `onNewPasswordAssigned(callback): void`

Registra um handler para o evento **`NewPasswordAssigned`** — disparado quando uma nova senha é gerada no totem e atribuída a uma fila.

---

#### `offAll(): void`

Remove **todos** os handlers de eventos SignalR registrados. Deve ser chamado antes de desconectar ou ao desmontar o componente para evitar memory leaks.

---

#### `isConnected(): boolean`

Verifica se a conexão SignalR está atualmente no estado `Connected`.

**Retorno:** `true` se conectado, `false` caso contrário.

---

### Contexto — AuthContext / AuthProvider

**Arquivo:** [`src/Web/src/contexts/AuthContext.tsx`](./src/Web/src/contexts/AuthContext.tsx)

Contexto React que gerencia o estado global de autenticação do usuário. Provê o usuário atual, estado de carregamento e funções de login/logout para toda a árvore de componentes.

**Estado exposto pelo contexto (`AuthContextType`):**

| Campo       | Tipo              | Descrição |
|-------------|-------------------|-----------|
| `user`      | `UserView \| null`| Dados do usuário logado (ou null) |
| `isLoading` | `boolean`         | Indica se a sessão está sendo restaurada |
| `signIn`    | `Function`        | Persiste a sessão após login |
| `signOut`   | `Function`        | Encerra a sessão |
| `refreshUser` | `Function`      | Atualiza os dados do usuário autenticado |

---

#### `AuthProvider` (Componente)

Provedor do contexto de autenticação. Deve envolver toda a aplicação (ou as rotas protegidas).

**Inicialização (useEffect):**
1. Chama `authService.getMeAsync()` para tentar restaurar a sessão via cookie.
2. Se bem-sucedido, persiste o usuário no storage e atualiza o estado.
3. Registra um listener para o evento global `onSessionExpired` (disparado pelo `StorageService`), que limpa o usuário do estado quando a sessão expira.

---

#### `signIn(userView: UserView): Promise<void>`

Salva os dados do usuário no `StorageService` e atualiza o estado do contexto.

**Uso:** Chamado pela página de login após autenticação bem-sucedida.

---

#### `signOut(): Promise<void>`

Realiza o logout completo: chama a API para revogar os tokens, limpa o storage e define `user` como `null`.

---

#### `refreshUser(): Promise<void>`

Recarrega os dados do usuário autenticado chamando `authService.getMeAsync()` e atualiza o storage e o estado.

**Uso:** Útil após alterações de perfil (nome, roles, etc.) para sincronizar a UI.

---

### Hooks React

---

#### `useAuth()`

**Arquivo:** [`src/Web/src/hooks/useAuth.ts`](./src/Web/src/hooks/useAuth.ts)

Hook de conveniência para consumir o `AuthContext`. Lança um erro descritivo se usado fora do `AuthProvider`.

**Retorno:** Objeto `AuthContextType` com `{ user, isLoading, signIn, signOut, refreshUser }`.

**Uso:**
```tsx
const { user, signOut } = useAuth();
```

---

#### `useSignalR(options: UseSignalROptions): UseSignalRResult`

**Arquivo:** [`src/Web/src/hooks/useSignalR.ts`](./src/Web/src/hooks/useSignalR.ts)

Hook que gerencia o ciclo de vida da conexão SignalR dentro de um componente React. Conecta-se automaticamente quando `serviceLocationId` é fornecido e desconecta ao desmontar o componente.

**Parâmetros (`UseSignalROptions`):**

| Campo                    | Tipo | Descrição |
|--------------------------|------|-----------|
| `serviceLocationId`      | `string \| null` | ID do local a monitorar. `null` impede a conexão. |
| `onPasswordCalled`       | `Function?` | Callback para evento de senha chamada |
| `onPasswordRecalled`     | `Function?` | Callback para evento de senha rechamada |
| `onPasswordServed`       | `Function?` | Callback para evento de senha atendida |
| `onNewPasswordAssigned`  | `Function?` | Callback para nova senha gerada |

**Retorno (`UseSignalRResult`):**

| Campo             | Tipo            | Descrição |
|-------------------|-----------------|-----------|
| `isConnected`     | `boolean`       | Estado atual da conexão |
| `connectionError` | `string \| null`| Mensagem de erro de conexão (ou null) |

**Detalhe interno:** Os callbacks são armazenados em um `useRef` para evitar re-execução do `useEffect` quando as funções mudam de referência, prevenindo loops desnecessários de conexão/desconexão.

**Uso:**
```tsx
const { isConnected } = useSignalR({
  serviceLocationId: selectedLocationId,
  onPasswordCalled: (data) => console.log('Chamada:', data),
});
```

---

#### `useIsMobile(): boolean`

**Arquivo:** [`src/Web/src/hooks/use-mobile.ts`](./src/Web/src/hooks/use-mobile.ts)

Hook que detecta se a janela do navegador está em resolução mobile (largura `< 768px`).

**Funcionamento:**
- Usa `window.matchMedia` para reagir a mudanças de tamanho em tempo real.
- Remove o listener de evento no cleanup do `useEffect`.

**Retorno:** `true` se a tela for mobile, `false` caso contrário.

**Uso:**
```tsx
const isMobile = useIsMobile();
```

---

## Backend — .NET (C#)

---

### IdentityService (C#)

**Arquivo:** [`src/Services/Totem.Application/Services/IdentityServices/IdentityService.cs`](./src/Services/Totem.Application/Services/IdentityServices/IdentityService.cs)

Serviço de aplicação responsável por toda a lógica de identidade e autenticação dos usuários, utilizando **ASP.NET Core Identity** e **JWT**.

**Dependências injetadas:**

| Dependência                  | Papel |
|------------------------------|-------|
| `UserManager<User>`          | CRUD de usuários e verificação de senhas |
| `SignInManager<User>`        | Login/logout e bloqueio de contas |
| `RoleManager<IdentityRole>`  | Gerenciamento de perfis/roles |
| `IMediator`                  | Publicação de eventos de domínio (MediatR) |
| `IRefreshTokenRepository`    | Persistência e revogação de refresh tokens |
| `IOptions<JwtSettings>`      | Configurações do JWT (secret, issuer, etc.) |

---

#### `GenerateJwtTokenAsync(User user): Task<(Result, string)>`

Gera um token JWT assinado com **HMAC-SHA256** para o usuário informado.

**Processo:**
1. Busca as roles do usuário via `UserManager`.
2. Monta as claims: `sub` (ID), `email`, `jti` (identificador único do token) e `ClaimTypes.Role` para cada role.
3. Cria o token com issuer, audience, expiração e credenciais de assinatura configuradas em `JwtSettings`.

**Retorno:** String com o token JWT codificado.

---

#### `GenerateJwtTokenAsync(Guid userId): Task<(Result, string)>`

Sobrecarga que aceita o ID do usuário (GUID) em vez da entidade `User`. Busca o usuário antes de delegar à sobrecarga principal.

---

#### `GetListUserAsync(): Task<(Result, List<UserSummary>)>`

Retorna a lista completa de usuários cadastrados, incluindo suas roles.

**Retorno:** Lista de `UserSummary` com `{ Id, FullName, Email, IsActive, Roles }`.

---

#### `LoginUserAsync(LoginUserView loginUserView): Task<(Result, AuthResult)>`

Autentica um usuário via e-mail e senha com suporte a bloqueio por tentativas.

**Fluxo:**
1. `PasswordSignInAsync` — verifica credenciais e aplica bloqueio temporário em caso de falhas repetidas.
2. Verifica se o usuário está ativo (`IsActive`).
3. Gera um novo refresh token (GUID) e publica o evento `SaveRefreshTokenEvent` via MediatR.
4. Gera o JWT via `GenerateJwtTokenAsync`.

**Retorno:** `AuthResult` com `{ Jwt, RefreshToken, UserView }`.

**Erros tratados:**
- `UserNotFound` — usuário não existe após login bem-sucedido (inconsistência)
- `UserInactive` — conta desativada
- `UserTemporarilyBlocked` — conta bloqueada por tentativas excessivas
- `IncorrectUsernamePassword` — credenciais inválidas

---

#### `RegisterUserAsync(RegisterUserView registerUserView): Task<(Result, AuthResult)>`

Cadastra um novo usuário e retorna as credenciais de acesso já autenticadas.

**Fluxo:**
1. Cria a entidade `User` com nome e e-mail.
2. `UserManager.CreateAsync` — persiste o usuário com hash de senha.
3. `SignInAsync` — realiza login automático após o registro.
4. Gera refresh token e JWT.

---

#### `InactiveUser(Guid userId): Task<Result>`

Inativa um usuário, bloqueando permanentemente sua conta.

**Processo:**
- Habilita autenticação de dois fatores.
- Define o `LockoutEndDate` como `DateTimeOffset.MaxValue` (bloqueio permanente).

---

#### `ActiveUser(Guid userId): Task<Result>`

Reativa um usuário previamente inativado.

**Processo:**
- Mantém 2FA habilitado.
- Define `LockoutEndDate` como `DateTimeOffset.UtcNow` (desbloqueio imediato).

---

#### `ChangePasswordAsync(Guid userId, ChangePasswordRequest request): Task<Result>`

Altera a senha do usuário, exigindo a senha antiga como confirmação. Valida que a nova senha é diferente da anterior.

| Parâmetro | Tipo                    | Descrição |
|-----------|-------------------------|-----------|
| `request` | `ChangePasswordRequest` | `{ OldPassword, NewPassword }` |

---

#### `UpdateEmailAsync(Guid userId, UpdateEmailRequest request): Task<Result>`

Atualiza o e-mail do usuário após verificar a senha atual.

| Parâmetro | Tipo                  | Descrição |
|-----------|-----------------------|-----------|
| `request` | `UpdateEmailRequest`  | `{ Password, NewEmail }` |

---

#### `UpdateUserRolesAsync(AssignRolesRequest request): Task<Result>`

Sincroniza as roles do usuário: adiciona as novas e remove as que não estão mais no conjunto solicitado.

**Lógica de diff:**
```
rolesToAdd    = requested - current
rolesToRemove = current - requested
```

Retorna erro se não há diferença (`PermissionListCannotBeEmpty`).

---

#### `ExistsUser(Guid userId): Task<bool>`

Verifica se um usuário com o ID informado existe no sistema.

**Retorno:** `true` se encontrado, `false` caso contrário.

---

#### `LogoutAsync(Guid userId): Task<Result>`

Realiza o logout do usuário: encerra a sessão do Identity e revoga todos os refresh tokens ativos.

**Processo:**
1. `SignOutAsync` — invalida a sessão do Identity.
2. Busca e revoga todos os refresh tokens do usuário via `IRefreshTokenRepository`.
3. Persiste as revogações no banco de dados.

---

#### `GetMeAsync(Guid userId): Task<(Result, UserView)>`

Retorna os dados do usuário autenticado (equivalente ao endpoint `/me`).

**Retorno:** `UserView` com `{ Id, Email, Name, IsActive, Roles }`.

---

### QueueService (C#)

**Arquivo:** [`src/Services/Totem.Application/Services/QueueServices/QueueService.cs`](./src/Services/Totem.Application/Services/QueueServices/QueueService.cs)

Serviço de aplicação para CRUD de filas de atendimento.

**Dependências:**

| Dependência         | Papel |
|---------------------|-------|
| `IQueueRepository`  | Persistência das entidades `Queue` |
| `IQueueQueries`     | Consultas otimizadas (leitura) |

---

#### `AddAsync(QueueRequest request): Task<Result>`

Cria uma nova fila de atendimento.

**Validações:**
- Executa o `QueueValidator` na entidade antes de persistir.
- Verifica duplicidade pelo nome (`ExistsAsync`).

---

#### `UpdateAsync(Guid id, QueueRequest request): Task<Result>`

Atualiza o nome de uma fila existente.

**Validações:**
- Valida a entidade com `QueueValidator`.
- Verifica se já existe outra fila com o mesmo nome.
- Verifica se a fila com o `id` informado existe.

---

#### `DeleteAsync(Guid id): Task<Result>`

Remove permanentemente uma fila.

**Validação:** Verifica se a fila existe antes de deletar.

---

#### `GetByIdAsync(Guid id): Task<(Result, QueueView)>`

Retorna os detalhes completos de uma fila pelo ID, via camada de consulta (`IQueueQueries`).

---

#### `GetListAsync(): Task<(Result, List<QueueSummary>)>`

Retorna a lista resumida de todas as filas cadastradas.

---

#### `ToggleStatusQueue(Guid id): Task<Result>`

Alterna o status (ativo/inativo) de uma fila chamando `queue.ToggleStatus()` na entidade de domínio.

---

### ServiceLocationService (C#)

**Arquivo:** [`src/Services/Totem.Application/Services/ServiceLocationServices/ServiceLocationService.cs`](./src/Services/Totem.Application/Services/ServiceLocationServices/ServiceLocationService.cs)

Serviço de aplicação para gerenciamento de locais de atendimento (guichês), incluindo integração com o sistema de senhas e notificações em tempo real.

**Dependências:**

| Dependência                      | Papel |
|----------------------------------|-------|
| `IServiceLocationRepository`     | Persistência dos guichês |
| `IServiceLocationQueries`        | Consultas otimizadas |
| `IPasswordIntegrationService`    | Integração com o sistema de senhas |
| `IPasswordRepository`            | Acesso direto às senhas para recall |
| `IRealTimeNotifier`              | Envio de notificações SignalR |

---

#### `AddAsync(ServiceLocationRequest request): Task<(Result, Guid)>`

Cria um novo local de atendimento.

**Validações:**
- `ServiceLocationValidator` na entidade.
- Duplicidade por `name` + `number`.

**Retorno:** GUID do local criado.

---

#### `DeleteAsync(Guid id): Task<Result>`

Remove um local de atendimento.

---

#### `UpdateAsync(Guid id, ServiceLocationRequest request): Task<Result>`

Atualiza nome e número de um local de atendimento.

**Validações:** Duplicidade e validação da entidade.

---

#### `GetByIdAsync(Guid id): Task<(Result, ServiceLocationView)>`

Retorna os detalhes de um local pelo ID via repositório.

---

#### `GetListAsync(): Task<(Result, List<ServiceLocationSummary>)>`

Retorna a lista completa de locais de atendimento via camada de consulta.

---

#### `ServiceLocationReadyAsync(Guid serviceLocationId, ServiceLocationReadyRequest request): Task<(Result, IPasswordView)>`

Sinaliza que um guichê está disponível e chama a próxima senha da fila.

**Processo:**
1. Verifica se o local existe.
2. Delega ao `IPasswordIntegrationService.ServiceLocationWaitingPasswordAsync` para buscar e chamar a próxima senha da fila.

**Retorno:** A senha chamada (`IPasswordView`) para exibição no painel.

---

#### `RecallCurrentPasswordAsync(Guid serviceLocationId): Task<Result>`

Relama a senha atual em atendimento no guichê informado.

**Processo:**
1. Busca a senha atual em atendimento via `IPasswordRepository.GetCurrentPasswordForServiceLocationAsync`.
2. Envia uma notificação SignalR de recall via `IRealTimeNotifier.NotifyPasswordRecalledAsync` com o código da senha e o nome do local.

**Uso:** Acionado quando o cidadão não se apresentou ao guichê e o atendente precisa rechamar.

---

> 📝 **Nota:** Este documento cobre as principais classes de serviço. Para detalhes sobre modelos de domínio, eventos, repositórios e controllers, consulte os respectivos diretórios em `src/Services/Totem.Domain`, `src/Services/Totem.Application/Events` e `src/Services/Totem.API`.
