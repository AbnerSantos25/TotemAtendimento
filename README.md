<div align="center">

# 🎫 TotemAtendimento

**Sistema completo de gerenciamento de filas e atendimento com arquitetura profissional.**

[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![React Native](https://img.shields.io/badge/React_Native-Expo-000020?style=for-the-badge&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: CC BY-NC-ND 4.0](https://img.shields.io/badge/License-CC_BY--NC--ND_4.0-lightgrey?style=for-the-badge)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

*Desenvolvido com arquitetura profissional seguindo os princípios de **DDD**, **SOLID** e **Clean Architecture**.*

</div>

---

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Segurança](#-segurança)
- [Testes](#-testes)
- [Primeiros Passos](#-primeiros-passos)
- [Documentação da API](#-documentação-da-api)
- [Padrões e Boas Práticas](#-padrões-e-boas-práticas)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🎯 Visão Geral

O **TotemAtendimento** é uma plataforma completa para gerenciamento inteligente de filas de espera, composta por **três frontends integrados** e um **backend robusto**. Ideal para clínicas, órgãos públicos, bancos e quaisquer estabelecimentos que precisam organizar o fluxo de atendimento.

| Funcionalidade | Descrição |
|---|---|
| 🎟️ **Geração de Senhas** | Senhas com prefixo customizável por tipo de serviço |
| 🏢 **Filas Inteligentes** | Múltiplas filas com status e priorização |
| 📍 **Locais de Atendimento** | Guichês com notificação em tempo real |
| 📊 **Dashboard Administrativo** | Painel web completo (React + Vite) |
| 📱 **App Móvel para Atendentes** | Expo / React Native |
| 🔴 **Tempo Real** | SignalR para atualizações instantâneas |
| 🔐 **Autenticação segura** | Cookies HttpOnly + JWT + CSRF + Rate Limiting |
| 🛡️ **Segurança Hardened** | XSS, CSRF, CWE-209 e Rate Limiting mitigados |

---

## 🛠️ Tecnologias

### Backend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **.NET / C#** | 9.0 | Framework e linguagem principal |
| **ASP.NET Core Web API** | 9.0 | API RESTful |
| **Entity Framework Core** | 9.0.3 | ORM e persistência |
| **SQL Server** | Latest | Banco de dados relacional |
| **ASP.NET Identity** | 9.0.3 | Gestão de usuários e roles |
| **JWT Bearer** | 9.0.3 | Tokens de autenticação |
| **SignalR** | 9.0 | Comunicação em tempo real |
| **MediatR** | 12.5.0 | Padrão Mediator / Domain Events |
| **FluentValidation** | 11.3.0 | Validação de domínio |
| **Swagger / OpenAPI** | 8.1.1 | Documentação interativa da API |
| **Microsoft.AspNetCore.RateLimiting** | nativo | Proteção contra força bruta e DDoS |

### Frontend Web (Painel Administrativo)
| Tecnologia | Uso |
|-----------|-----|
| **React 19** | Framework de UI |
| **Vite 7** | Build tool e dev server |
| **TypeScript 5.9** | Tipagem estática |
| **Tailwind CSS v4** | Estilização utilitária |
| **shadcn/ui** | Componentes de UI acessíveis |
| **React Hook Form + Zod** | Formulários com validação de esquema |
| **React Router v7** | Roteamento SPA |
| **Recharts** | Gráficos e visualizações |
| **Sonner** | Notificações toast |
| **@dnd-kit** | Reordenação de linhas nas tabelas de dados (sortable rows) |
| **@tanstack/react-table** | Tabelas avançadas |

### App Mobile (Atendentes)
| Tecnologia | Uso |
|-----------|-----|
| **React Native 0.82** | Framework multiplataforma |
| **Expo 54** | Toolchain e runtime |
| **Expo Router 6** | Navegação orientada a arquivos |
| **i18next / react-i18next** | Internacionalização (i18n) |

### Testes
| Tecnologia | Camada |
|-----------|--------|
| **xUnit** | Framework de testes (todas as camadas) |
| **Moq** | Mocks para testes unitários |
| **FluentAssertions** | Assertions legíveis |
| **WebApplicationFactory** | Testes de integração e E2E |

---

## 🏗️ Arquitetura

O projeto segue a **arquitetura em camadas** baseada em **Domain-Driven Design (DDD)**, garantindo separação clara de responsabilidades e independência de frameworks.

### Fluxo de uma Requisição

```
Cliente HTTP (Web / Mobile)
        │
        ▼
   Middleware Pipeline
  (GlobalException → RateLimiter → CSRF → Auth)
        │
        ▼
  API Layer (Controllers)
        │
        ▼
  Application Layer (Services + MediatR Events)
        │
        ▼
  Domain Layer ❤️ (Aggregates + Business Rules)
        │
        ▼
  Infrastructure Layer (EF Core + Repositories)
        │
        ▼
     SQL Server
```

### Padrões de Design

| Padrão | Implementação | Benefício |
|--------|--------------|-----------| 
| **Repository** | `IPasswordRepository`, `IQueueRepository`, etc. | Abstração do acesso a dados |
| **CQRS** | Queries separadas de Commands/Repositórios | Separação entre leitura e escrita |
| **Mediator** | MediatR + Domain Event Handlers | Desacoplamento de eventos |
| **Aggregate Root** | `Password`, `Queue`, `ServiceLocation`, `User` | Coesão de domínio |
| **Unit of Work** | `SharedDbContext` | Transações consistentes |
| **Dependency Injection** | Container nativo .NET | Testabilidade e flexibilidade |
| **Factory** | Construtores privados com validação | Objetos válidos por construção |
| **Extension Methods** | `ApiConfiguration`, `RateLimitingConfiguration` | Program.cs limpo e semântico |

---

## 📁 Estrutura do Projeto

```
TotemAtendimento/
│
├── src/
│   ├── Services/                          # Camadas do backend
│   │   ├── Totem.API/                     # Apresentação (REST API)
│   │   │   ├── Controllers/               # Endpoints REST
│   │   │   ├── Configuration/             # ApiConfiguration, RateLimitingConfiguration, etc.
│   │   │   ├── Middleware/                # GlobalExceptionMiddleware (CWE-209)
│   │   │   ├── RealTime/                  # SignalR Hubs
│   │   │   └── Program.cs                 # Entry point limpo
│   │   │
│   │   ├── Totem.Application/             # Lógica de aplicação
│   │   │   ├── Services/                  # Application Services (orquestração)
│   │   │   ├── Events/                    # Domain Event Handlers (MediatR)
│   │   │   └── Configurations/            # DI Setup
│   │   │
│   │   ├── Totem.Domain/                  # ❤️ Core — Regras de negócio
│   │   │   ├── Aggregates/                # Raízes de agregado
│   │   │   │   ├── PasswordAggregate/
│   │   │   │   ├── QueueAggregate/
│   │   │   │   ├── ServiceLocationAggregate/
│   │   │   │   ├── UserAggregate/
│   │   │   │   └── RefreshTokenAggregate/
│   │   │   ├── Models/                    # DTOs & ViewModels
│   │   │   └── Events/                    # Domain Events
│   │   │
│   │   ├── Totem.Infra/                   # Infraestrutura & Persistência
│   │   │   ├── Data/
│   │   │   │   ├── Repositories/          # Implementação dos repositórios
│   │   │   │   ├── Queries/               # Queries de leitura especializadas
│   │   │   │   ├── Mappings/              # EF Core Fluent API
│   │   │   │   └── TotemDbContext.cs
│   │   │   └── Migrations/
│   │   │
│   │   └── Totem.SharedKernel/            # Contratos compartilhados entre serviços
│   │
│   ├── Shared/                            # Código transversal
│   │   ├── Totem.Common/                  # Classes base, utilitários e segurança
│   │   │   ├── Domain/                    # Entity, IAggregateRoot
│   │   │   ├── Services/                  # Result<T>, BaseService, Notificator
│   │   │   ├── Security/                  # HtmlSanitizerStringConverter (XSS)
│   │   │   ├── Enumerations/              # Enums (Role, PasswordHistoryEventType)
│   │   │   └── Localization/              # Resources i18n (PT-BR)
│   │   │
│   │   └── Totem.Common.API/              # Abstrações HTTP
│   │       ├── Controllers/               # MainController base
│   │       ├── Filters/                   # ValidateCookieAntiforgery
│   │       └── Data/                      # SharedDbContext
│   │
│   ├── Web/                               # 🌐 Painel Administrativo (React + Vite)
│   │   └── src/
│   │       ├── pages/                     # auth/, configuration/, dashboard/, user/
│   │       ├── components/                # Componentes reutilizáveis (shadcn/ui)
│   │       ├── services/                  # Camada HTTP (BaseService + domínios)
│   │       ├── contexts/                  # AuthContext (Zustand)
│   │       ├── hooks/                     # Custom hooks
│   │       └── models/                    # Interfaces TypeScript
│   │
│   └── Mobile/                            # 📱 App para Atendentes (Expo)
│       ├── app/                           # Páginas Expo Router
│       ├── shared/                        # Componentes e serviços compartilhados
│       └── locales/                       # Traduções i18n
│
├── tests/                                 # 🧪 Suíte de testes
│   ├── Totem.UnitTests/                   # Testes unitários com Moq
│   ├── Totem.IntegrationTests/            # Testes com WebApplicationFactory
│   └── Totem.E2ETests/                    # Fluxos E2E críticos
│
├── TESTING.md                             # Guia para execução de testes
├── README.md                              # Este arquivo
└── TotemAtendimento.sln
```

---

## 🔐 Segurança

A aplicação passou por um processo de **hardening de segurança** cobrindo múltiplos vetores de ataque:

| Proteção | Como foi implementada |
|---|---|
| **Cookies HttpOnly** | `access_token` e `refresh_token` com `HttpOnly=true`, `Secure=true`, `SameSite=Strict` |
| **HTTPS** | Kestrel configurado com HTTPS + Vite com `@vitejs/plugin-basic-ssl` |
| **CSRF** | Anti-Forgery Token em cookie (`XSRF-TOKEN`) + header validado via filtro |
| **XSS — Sanitização de Input** | `HtmlSanitizerStringConverter` via `JsonConverter`, aplicado globalmente no pipeline de desserialização |
| **XSS — Renderização Segura** | React escapa strings por padrão; injeções de classe (ícones) e CSS dinâmico sanitizados com Regex |
| **CWE-209 — Info Leakage** | `GlobalExceptionMiddleware` garante que stack traces e erros internos nunca chegam ao cliente |
| **Rate Limiting** | 3 políticas por IP com `FixedWindowLimiter`: `Global` (100/min), `Auth` (5/min), `Mutation` (30/min) |
| **Autorização** | `[Authorize(Roles = "Admin")]` na classe base `MainController`, com controle granular por endpoint |

> ⚠️ **Em produção**, certifique-se de executar `dotnet dev-certs https --trust` para confiar no certificado de desenvolvimento, e configure seus certificados de produção via variáveis de ambiente.

---

## 🧪 Testes

O projeto conta com **3 camadas de testes** automatizadas:

```
tests/
├── Totem.UnitTests/        → Lógica isolada — Moq + FluentAssertions
├── Totem.IntegrationTests/ → Pipeline da API em memória — WebApplicationFactory
└── Totem.E2ETests/         → Fluxos HTTP críticos ponta a ponta
```

### O que está coberto hoje:

| Camada | Arquivo | O que testa |
|---|---|---|
| Unit | `HtmlSanitizerStringConverterTests` | Sanitização de XSS no input da API |
| Unit | `ServiceTypeServiceTests` | Regras de negócio de CRUD |
| Integration | `GlobalExceptionMiddlewareTests` | Stack trace nunca vaza (CWE-209) |
| Integration | `RateLimitingTests` | Retorno de 429 e mensagem amigável |
| E2E | `AuthenticationFlowTests` | Login inválido, acesso negado, registro |

**Executar toda a suíte:**
```bash
dotnet test
```

📖 Consulte o [TESTING.md](./TESTING.md) para o guia completo de comandos e filtros.

---

## 🚀 Primeiros Passos

### Pré-requisitos

- [.NET 9 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)
- [SQL Server 2022+](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) ou Express
- [Node.js 20+](https://nodejs.org/) e npm
- [Git](https://git-scm.com/)
- IDE: [Visual Studio 2022](https://visualstudio.microsoft.com/) ou [VS Code](https://code.visualstudio.com/)

---

### 🔷 Backend (API)

```bash
# 1. Clone o repositório
git clone https://github.com/AbnerSantos25/TotemAtendimento.git
cd TotemAtendimento

# 2. Restaure os pacotes NuGet
dotnet restore

# 3. Configure as variáveis de ambiente
# Copie o arquivo de exemplo e preencha com suas credenciais:
cp src/Services/Totem.API/appsettings.Example.json src/Services/Totem.API/appsettings.Development.json

# 4. Execute as migrations
dotnet ef database update --project src/Services/Totem.Infra --startup-project src/Services/Totem.API

# 5. Execute a API
dotnet run --project src/Services/Totem.API
```

> ⚠️ **Nunca commite** arquivos `appsettings.Development.json` ou qualquer arquivo contendo connection strings, secrets JWT ou senhas reais. Esses arquivos já estão listados no `.gitignore`.

> Após executar a API, o Swagger estará disponível na porta configurada em `launchSettings.json` — verifique o terminal após o `dotnet run`.

---

### 🌐 Frontend Web (Painel Admin)

```bash
cd src/Web
npm install
npm run dev
```

> A URL ativa será exibida no terminal após o `npm run dev`.

---

### 📱 App Mobile (Atendentes)

```bash
cd src/Mobile
npm install
npm start
```

> Use o **Expo Go** no celular ou um emulador Android/iOS.

---

## 📚 Documentação da API

### Autenticação
Toda autenticação utiliza **cookies HttpOnly** (sem exposição de tokens no JavaScript). O cookie `XSRF-TOKEN` deve ser lido e enviado via header `X-XSRF-TOKEN` em requisições mutáveis.

### Endpoints Principais

#### Identity (Autenticação)
```http
POST   /api/totem/identity/register          # Registrar usuário
POST   /api/totem/identity/login             # Fazer login (define cookies)
GET    /api/totem/identity/me                # Obter usuário autenticado
POST   /api/totem/identity/logout/{userId}   # Logout (revoga tokens)
GET    /api/totem/identity/users             # Listar usuários [Admin]
PUT    /api/totem/identity/user/{id}/update-email
PATCH  /api/totem/identity/user/{id}/inactivate
PATCH  /api/totem/identity/user/{id}/active
POST   /api/totem/identity/assign-roles
POST   /api/totem/identity/user/{id}/change-password
```

#### Queues (Filas)
```http
GET    /api/totem/queue              # Listar todas as filas
GET    /api/totem/queue/{id}         # Obter fila específica
POST   /api/totem/queue              # Criar nova fila
PUT    /api/totem/queue/{id}         # Atualizar fila
DELETE /api/totem/queue/{id}         # Deletar fila
PATCH  /api/totem/queue/{id}/toggleQueueStatus # Ativar/Desativar
```

#### Passwords (Senhas de Atendimento)
```http
GET    /api/totem/password           # Listar senhas em atendimento
GET    /api/totem/password/{id}      # Obter senha específica
POST   /api/totem/password           # Gerar nova senha
POST   /api/totem/password/{id}/transfer  # Transferir senha de fila
PATCH  /api/totem/password/{id}/MarkAsServed # Marcar como atendida
DELETE /api/totem/password           # Remover senha
```

#### ServiceTypes (Tipos de Atendimento)
```http
GET    /api/totem/servicetype        # Listar tipos
GET    /api/totem/servicetype/active # Listar tipos ativos
GET    /api/totem/servicetype/{id}
POST   /api/totem/servicetype
PUT    /api/totem/servicetype/{id}
DELETE /api/totem/servicetype/{id}
PATCH  /api/totem/servicetype/{id}/toggle-status
PATCH  /api/totem/servicetype/{id}/disable
```

#### ServiceLocations (Locais de Atendimento / Guichês)
```http
GET    /api/totem/servicelocation
GET    /api/totem/servicelocation/{id}
POST   /api/totem/servicelocation
PUT    /api/totem/servicelocation/{id}
DELETE /api/totem/servicelocation/{id}
POST   /api/totem/servicelocation/{id}/ready  # Notifica guichê pronto
```

---

## 🎨 Padrões e Boas Práticas

### Domain-Driven Design (DDD)

Cada **Aggregate Root** encapsula coerência de negócio:

- **Password** — Senha de atendimento, com histórico de eventos (`PasswordHistory`)
- **Queue** — Fila com suas configurações e senhas
- **ServiceLocation** — Guichê de atendimento
- **User** — Usuário do sistema (via ASP.NET Identity)
- **RefreshToken** — Token revogável para renovação de sessão

**Domain Events via MediatR:**
```csharp
// Evento publicado ao criar uma nova senha
public record PasswordCreatedEvent(Guid PasswordId, Guid QueueId) : INotification;

// Handler reage ao evento e notifica o SignalR Hub
public class PasswordQueueChangedHistoryEventHandler
    : INotificationHandler<PasswordQueueChangedEvent> { ... }
```

### SOLID Principles

| Princípio | Implementação |
|-----------|--------------| 
| **S** — Single Responsibility | Services especializados por aggregate |
| **O** — Open/Closed | Interfaces de repositório para abstrair mudanças |
| **L** — Liskov Substitution | `BaseService` e `MainController` garantem contratos |
| **I** — Interface Segregation | Uma interface por funcionalidade |
| **D** — Dependency Inversion | DI Container nativo do .NET |

### Fluxo Completo: Geração de Senha

```
1. POST /api/totem/password
   ↓ Rate Limiting ("Mutation" — 30/min)
   ↓ CSRF Validation
   ↓ JWT Auth Cookie
2. PasswordController → PasswordService
3. Password.Create() — validação de domínio
4. PasswordRepository.Add()
5. UnitOfWork.CommitAsync()
6. MediatR publica PasswordCreatedEvent
7. EventHandler → SignalR Hub
8. Todos os clientes conectados recebem notificação em tempo real
```

---

## 🐛 Troubleshooting

| Problema | Solução |
|---|---|
| Erro de conexão com banco | Verifique se o banco está rodando e a string de conexão em `appsettings.Development.json` (nunca commite este arquivo) |
| O browser exibe aviso de certificado HTTPS | Execute `dotnet dev-certs https --trust` como Administrador (apenas em ambiente de desenvolvimento) |
| Swagger não carrega | Confirme a porta no `launchSettings.json` e acesse `https://localhost:{PORTA}/swagger` |
| Migrations com conflito | `dotnet ef migrations remove` → recrie com `dotnet ef migrations add <Nome>` |
| CORS bloqueando o frontend | Confirme que a URL do frontend está listada em `AllowedOrigins` no `appsettings.Development.json` |
| Rate Limiting bloqueando em dev | Normal em testes rápidos — o limite reseta automaticamente a cada minuto |

---

## 🤝 Contribuição

Contribuições são bem-vindas! Siga as etapas:

1. **Fork** o repositório
2. **Crie** sua branch: `git checkout -b feature/MinhaFeature`
3. **Commit**: `git commit -m "feat: adiciona MinhaFeature"`
4. **Push**: `git push origin feature/MinhaFeature`
5. **Abra** um Pull Request

### Convenção de Commits (Conventional Commits)

```
feat:     Nova funcionalidade
fix:      Correção de bug
security: Melhoria de segurança
refactor: Melhoria de código sem alterar comportamento
test:     Adição ou atualização de testes
docs:     Atualização de documentação
chore:    Atualizações de build, deps, configurações
```

---

## 📄 Licença

Este projeto está licenciado sob a **Creative Commons — Atribuição-NãoComercial-SemDerivações 4.0 Internacional (CC BY-NC-ND 4.0)**.

🔗 [Leia os termos da licença completa aqui](https://creativecommons.org/licenses/by-nc-nd/4.0/)

| ✅ Permitido | ❌ Não permitido |
|---|---|
| Uso educacional e aprendizado | Uso comercial |
| Estudar e entender o código | Modificar e redistribuir |
| Forks para uso pessoal não-comercial | Uso em produtos ou serviços pagos |

© 2025 [Abner da Silva Santos](https://github.com/AbnerSantos25) · [Gabriel Lucas Oliveira Fernandes](https://github.com/Se77ings)

---

## 👥 Autores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/AbnerSantos25">
        <b>Abner da Silva Santos</b><br/>
        <sub>Backend Architecture · Security · DevOps</sub><br/>
        <a href="https://www.linkedin.com/in/abnerssantos/">LinkedIn</a>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Se77ings">
        <b>Gabriel Lucas Oliveira Fernandes</b><br/>
        <sub>Frontend · Mobile · UI/UX</sub><br/>
        <a href="https://www.linkedin.com/in/gabriel-lucas-oliveira-fernandes-6a2965159/">LinkedIn</a>
      </a>
    </td>
  </tr>
</table>

---

## 📞 Suporte

- 🐛 Encontrou um bug? [Abra uma Issue](https://github.com/AbnerSantos25/TotemAtendimento/issues)
- 💬 Dúvidas e sugestões? [Veja as Discussions](https://github.com/AbnerSantos25/TotemAtendimento/discussions)

---

## 🎓 Recursos Educacionais

- [Clean Architecture — Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design — Eric Evans](https://www.domainlanguage.com/ddd/)
- [SOLID Principles — Microsoft Docs](https://docs.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles)
- [Entity Framework Core — Docs](https://docs.microsoft.com/en-us/ef/core/)
- [ASP.NET Core Rate Limiting](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

<div align="center">
  <sub>Última atualização: Abril de 2025 · Versão 1.1.0</sub>
</div>
