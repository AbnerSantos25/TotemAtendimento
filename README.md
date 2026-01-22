# 🎫 TotemAtendimento

Sistema completo de gerenciamento de filas de espera e atendimento com interface moderna. Desenvolvido como projeto de estudos com arquitetura profissional, seguindo princípios de **Domain-Driven Design (DDD)** e **SOLID**.

> **Nota:** Este projeto é de código aberto para fins educacionais e não está disponível para fins comerciais.

---

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Primeiros Passos](#-primeiros-passos)
- [Documentação da API](#-documentação-da-api)
- [Padrões e Boas Práticas](#-padrões-e-boas-práticas)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🎯 Visão Geral

O **TotemAtendimento** é uma plataforma para gerenciamento inteligente de filas de espera. O sistema facilita:

✅ **Criar e gerenciar filas de atendimento**  
✅ **Gerar senhas com suporte a priorização**  
✅ **Atribuir senhas a locais de atendimento**  
✅ **Acompanhamento em tempo real via SignalR**  
✅ **Autenticação segura com JWT e refresh tokens**  
✅ **Histórico completo de eventos**  
✅ **Histórico de alterações de senhas**  

---

## 🛠️ Tecnologias

### Backend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **.NET** | 9.0 | Framework principal |
| **C#** | 12+ | Linguagem de programação |
| **ASP.NET Core Web API** | 9.0 | Framework HTTP |
| **Entity Framework Core** | 9.0.3 | ORM e acesso a dados |
| **SQL Server** | Latest | Banco de dados |
| **MediatR** | 12.5.0 | Padrão Mediator para eventos |
| **FluentValidation** | 11.3.0 | Validação fluente |
| **SignalR** | 9.0 | Comunicação em tempo real |
| **JWT Bearer** | 9.0.3 | Autenticação |
| **Swagger/OpenAPI** | 8.1.1 | Documentação da API |

### Frontend
| Tecnologia | Uso |
|-----------|-----|
| **React Native** | Framework multiplataforma |
| **Framework UI** | Withfra.me Components |

---

## 🏗️ Arquitetura

O projeto segue a **arquitetura em camadas** baseada em **Domain-Driven Design (DDD)**, garantindo:

- ✅ **Separação de Responsabilidades** (SOLID - SRP)
- ✅ **Inversão de Controle** (SOLID - DIP)
- ✅ **Code Reusability** (SOLID - OCP)
- ✅ **Independência de Frameworks** (Clean Architecture)

### Fluxo de Requisição

```
Cliente HTTP
    ↓
API Layer (Controllers + MainController)
    ↓
Application Layer (Services + Commands/Queries)
    ↓
Domain Layer (Business Logic + Aggregates + Events)
    ↓
Infrastructure Layer (Repositories + DbContext + EF Core)
    ↓
SQL Server Database
```

### Padrões de Design Utilizados

| Padrão | Implementação | Benefício |
|--------|--------------|-----------|
| **Repository** | `IPasswordRepository`, `IQueueRepository`, etc | Abstração do acesso a dados |
| **CQRS** | Queries & Repositories | Separação entre leitura e escrita |
| **Mediator** | MediatR + Event Handlers | Desacoplamento de eventos |
| **Aggregate** | Password, Queue, ServiceLocation | Coesão de domínio |
| **Unit of Work** | `SharedDbContext` | Transações consistentes |
| **Dependency Injection** | Container nativo do .NET | Flexibilidade e testabilidade |
| **Factory** | Constructores privados com validação | Objetos válidos por construção |

---

## 📁 Estrutura do Projeto

```
TotemAtendimento/
├── src/
│   ├── Services/                          # Serviços de negócio
│   │   ├── Totem.API/                    # Apresentação (REST API)
│   │   │   ├── Controllers/              # Endpoints (REST)
│   │   │   ├── Configuration/            # Setup da API
│   │   │   ├── RealTime/                 # SignalR Hubs
│   │   │   └── Program.cs                # Entry point
│   │   │
│   │   ├── Totem.Application/            # Lógica de aplicação
│   │   │   ├── Services/                 # Application Services
│   │   │   ├── Events/                   # Event Handlers
│   │   │   └── Configurations/           # DI Setup
│   │   │
│   │   ├── Totem.Domain/                 # Lógica de domínio (CORE)
│   │   │   ├── Aggregates/               # Raízes de agregado
│   │   │   │   ├── PasswordAggregate/   # Senhas
│   │   │   │   ├── QueueAggregate/      # Filas
│   │   │   │   ├── ServiceLocationAggregate/ # Locais
│   │   │   │   ├── UserAggregate/       # Usuários
│   │   │   │   └── RefreshTokenAggregate/
│   │   │   ├── Models/                   # DTOs & ViewModels
│   │   │   └── Events/                   # Domain Events
│   │   │
│   │   ├── Totem.Infra/                  # Infraestrutura & Persistência
│   │   │   ├── Data/
│   │   │   │   ├── Repositories/         # Implementação de repositórios
│   │   │   │   ├── Queries/              # Queries especializadas
│   │   │   │   ├── Mappings/             # EF Core Fluent API
│   │   │   │   ├── TotemDbContext.cs     # DbContext principal
│   │   │   │   └── IdentityData/         # Contexto de identidade
│   │   │   └── Migrations/               # EF Core Migrations
│   │   │
│   │   └── Totem.SharedKernel/           # Contratos compartilhados
│   │       └── Services/                 # Interfaces de integração
│   │
│   └── Shared/                           # Código compartilhado
│       ├── Totem.Common/                 # Base classes & utilities
│       │   ├── Domain/                   # Entity, IAggregateRoot
│       │   ├── Services/                 # Result, BaseService
│       │   ├── Validation/               # Custom attributes
│       │   ├── Enumerations/             # Enums (Roles, etc)
│       │   └── Localization/             # i18n Resources
│       │
│       └── Totem.Common.API/             # Abstrações HTTP
│           ├── Controllers/              # MainController base
│           ├── Data/                     # SharedDbContext
│           └── Configurations/           # Middleware & DI
│
├── README.md                             # Este arquivo
└── .gitignore
```

### 📦 Projetos e Responsabilidades

#### **Totem.API** 
- Camada de apresentação (HTTP)
- Controllers RESTful
- Configuração de Swagger/OpenAPI
- SignalR para notificações em tempo real
- Autenticação e identidade

#### **Totem.Application**
- Lógica de aplicação de alto nível
- Application Services (orquestração)
- Event Handlers (reatividade)
- Configuração de dependências

#### **Totem.Domain** (❤️ Core)
- Regras de negócio puras
- Agregados (Password, Queue, ServiceLocation, User, RefreshToken)
- Domain Events
- Validações de domínio
- Interfaces de repositório (contratos)

#### **Totem.Infra**
- Implementação de repositórios
- DbContext (EF Core)
- Queries especializadas
- Migrations
- Identidade (AppIdentityDbContext)

#### **Totem.Common** (Shared)
- Classes base (Entity, IAggregateRoot)
- Serviços comuns (Result, Notificator)
- Enums (Roles, PasswordHistoryEventType)
- Resources de localização (i18n)
- Atributos de validação customizados

#### **Totem.Common.API** (Shared)
- MainController base com respostas padronizadas
- SharedDbContext base
- Configurações de transações
- Middlewares

#### **Totem.SharedKernel**
- Contratos para integração entre serviços
- Interfaces de serviços especializados

---

## 🚀 Primeiros Passos

### Pré-requisitos
- [.NET 9 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)
- [SQL Server 2022+](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) ou Express
- [Git](https://git-scm.com/)
- IDE: [Visual Studio 2022](https://visualstudio.microsoft.com/) ou [VS Code](https://code.visualstudio.com/)

### Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/AbnerSantos25/TotemAtendimento.git
cd TotemAtendimento
```

2. **Restaure os pacotes NuGet:**
```bash
dotnet restore
```

3. **Configure a conexão do banco de dados:**

Edite `appsettings.json` em `src/Services/Totem.API/`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=TotemDb;User Id=sa;Password=YOUR_PASSWORD;TrustServerCertificate=True;",
    "IdentityConnection": "Server=YOUR_SERVER;Database=TotemIdentityDb;User Id=sa;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
  }
}
```

4. **Execute as migrations:**
```bash
cd src/Services/Totem.API
dotnet ef database update --project ../Totem.Infra
```

5. **Execute a aplicação:**
```bash
dotnet run --project src/Services/Totem.API
```

6. **Acesse a API:**
- API: `https://localhost:7275` (ou a porta configurada)
- Swagger UI: `https://localhost:7275/swagger`

---

## 📚 Documentação da API

### Endpoints Principais

#### **Queues (Filas)**
```http
GET    /api/totem/queue              # Listar todas as filas
GET    /api/totem/queue/{id}         # Obter fila específica
POST   /api/totem/queue              # Criar nova fila
PUT    /api/totem/queue/{id}         # Atualizar fila
DELETE /api/totem/queue/{id}         # Deletar fila
```

#### **Passwords (Senhas)**
```http
GET    /api/totem/password           # Listar senhas
GET    /api/totem/password/{id}      # Obter senha específica
POST   /api/totem/password           # Gerar nova senha
PUT    /api/totem/password/{id}/transfer  # Transferir senha
PUT    /api/totem/password/{id}/served    # Marcar como atendida
```

#### **ServiceLocations (Locais de Atendimento)**
```http
GET    /api/totem/servicelocation    # Listar locais
GET    /api/totem/servicelocation/{id} # Obter local específico
POST   /api/totem/servicelocation    # Criar local
PUT    /api/totem/servicelocation/{id} # Atualizar local
```

#### **Identity (Autenticação)**
```http
POST   /api/totem/identity/register  # Registrar usuário
POST   /api/totem/identity/login     # Fazer login
POST   /api/totem/refreshtoken       # Renovar token
POST   /api/totem/password/update    # Atualizar senha
```

### Autenticação
Todas as requisições (exceto login e registro) requerem header:
```
Authorization: Bearer <seu_jwt_token>
```

### Documentação Interativa
Visite o **Swagger UI** em `https://localhost:7275/swagger` para explorar todos os endpoints com exemplos.

---

## 🎨 Padrões e Boas Práticas

### Domain-Driven Design (DDD)

#### **Aggregates (Agregados)**
- **Password**: Raiz agregada com entidades PasswordHistory
- **Queue**: Gerencia senhas e validações
- **ServiceLocation**: Local de atendimento
- **User**: Gerenciamento de identidade
- **RefreshToken**: Tokens de renovação

Cada agregado encapsula lógica de negócio coerente e mantém invariantes.

#### **Domain Events**
```csharp
// Exemplo: PasswordCreatedEvent
public record PasswordCreatedEvent(Guid PasswordId, Guid QueueId) : INotification;

// Handler assíncrono via MediatR
public class PasswordQueueChangedHistoryEventHandler 
    : INotificationHandler<PasswordQueueChangedEvent>
```

### SOLID Principles

| Princípio | Implementação |
|-----------|--------------|
| **S** - Single Responsibility | Services especializados (PasswordService, QueueService, etc) |
| **O** - Open/Closed | Interfaces de repositório abstraem mudanças |
| **L** - Liskov Substitution | BaseService e MainController garantem contrato |
| **I** - Interface Segregation | Múltiplas interfaces específicas por funcionalidade |
| **D** - Dependency Inversion | Injeção de dependências via DI Container |

### Clean Code & Boas Práticas

✅ **Nomenclatura Significativa**: Classes, métodos e variáveis bem nomeadas  
✅ **Funções Pequenas**: Cada função tem responsabilidade única  
✅ **DRY (Don't Repeat Yourself)**: Código reutilizável em classes base  
✅ **KISS (Keep It Simple)**: Lógica compreensível e direta  
✅ **Comentários Significativos**: Explicam o "por quê", não o "o quê"  
✅ **Async/Await**: Operações I/O não-bloqueantes  
✅ **Nullable Reference Types**: Segurança em tipos ativada  

### Design Patterns Utilizados

#### **Repository Pattern**
```csharp
public interface IPasswordRepository : IRepository<Password>
{
    Task<Password?> GetByCodeAsync(int code);
}
```

#### **Service Layer**
```csharp
public class PasswordService : IPasswordService
{
    // Orquestra domínio, repositório e eventos
}
```

#### **Event Sourcing (via History)**
```csharp
public class PasswordHistory : Entity
{
    public Guid PasswordId { get; private set; }
    public PasswordHistoryEventType EventType { get; private set; }
    public DateTime CreatedAt { get; private set; }
}
```

#### **Real-Time Notifications (SignalR)**
```csharp
public class SignalRNotifier : IRealTimeNotifier
{
    public Task NotifyPasswordAssignedAsync(Guid serviceLocationId, int code, DateTime createdAt)
    {
        return _hub.Clients
                   .Group(serviceLocationId.ToString())
                   .SendAsync("NewPasswordAssigned", new { code, createdAt });
    }
}
```

### Entity Framework Core Best Practices

✅ **Fluent API Mappings**: Configuração de entidades em classes dedicadas  
✅ **Migrations Versionadas**: Histórico completo de schema  
✅ **DbContext Abstração**: SharedDbContext para compartilhamento  
✅ **Índices Otimizados**: Queries de performance  
✅ **Lazy Loading Evitado**: Include explícito quando necessário  

### Validação

#### **FluentValidation**
```csharp
public class QueueValidator : AbstractValidator<Queue>
{
    public QueueValidator()
    {
        RuleFor(q => q.Name)
            .NotEmpty().WithMessage("Nome é obrigatório")
            .MaximumLength(100);
    }
}
```

#### **Data Annotations**
```csharp
[RequiredValidation(ErrorMessage = "Campo obrigatório")]
public string Name { get; set; }
```

---

## 🔄 Fluxos Principais

### Criação de Senha (Password Flow)

```
1. Cliente POST /api/totem/password
   ↓
2. PasswordController.CreateAsync()
   ↓
3. PasswordService.CreateAsync()
   ↓
4. Password.Create() - Validação de domínio
   ↓
5. PasswordRepository.AddAsync()
   ↓
6. Database Save → PasswordCreatedEvent
   ↓
7. MediatR publica evento
   ↓
8. SignalRNotifier.NotifyPasswordAssignedAsync()
   ↓
9. Cliente recebe notificação em tempo real via SignalR
```

### Autenticação e Refresh Token

```
1. Cliente POST /api/totem/identity/login
   ↓
2. IdentityService.LoginAsync()
   ↓
3. JWT Token gerado + Refresh Token armazenado
   ↓
4. Cliente pode renovar token com POST /api/totem/refreshtoken
   ↓
5. Novo JWT fornecido
```

---

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se SQL Server está rodando
- Confirme a string de conexão em `appsettings.json`
- Execute as migrations: `dotnet ef database update`

### Migrations com conflito
```bash
# Remova a migration problemática
dotnet ef migrations remove

# Recrie
dotnet ef migrations add MigrationName
dotnet ef database update
```

### Swagger não carrega
- Verifique se a URL é `https://localhost:PORTA/swagger`
- Limpe o cache do navegador
- Verifique os logs em `Output` window

---

## 🤝 Contribuição

Contribuições são bem-vindas! Siga as etapas:

1. **Fork** o repositório
2. **Crie** uma branch para sua feature: `git checkout -b feature/MinhaFeature`
3. **Commit** suas mudanças: `git commit -m "Adiciona MinhaFeature"`
4. **Push** para a branch: `git push origin feature/MinhaFeature`
5. **Abra** um Pull Request

### Padrões de Commit
```
feat: Adiciona nova funcionalidade
fix: Corrige bug
docs: Atualiza documentação
refactor: Melhora código sem alterar funcionalidade
test: Adiciona testes
chore: Atualizações de build ou dependências
```

---

## 📄 Licença

Este projeto está licenciado sob a **Creative Commons - Atribuição-NãoComercial-SemDerivações 4.0 Internacional (CC BY-NC-ND 4.0)**.

🔗 [Leia os termos da licença aqui](https://creativecommons.org/licenses/by-nc-nd/4.0/)

**O que você pode fazer:**
- ✅ Usar para fins educacionais e de aprendizado
- ✅ Estudar e entender o código
- ✅ Criar derivados para uso pessoal não-comercial

**O que você NÃO pode fazer:**
- ❌ Usar comercialmente
- ❌ Modificar e distribuir
- ❌ Usar em produtos pagos ou serviços

© 2025 [Abner da Silva Santos](https://github.com/AbnerSantos25), [Gabriel Lucas Oliveira Fernandes](https://github.com/Se77ings)

---

## 👥 Autores

| Nome | GitHub | LinkedIn |
|------|--------|----------|
| **Abner da Silva Santos** | [@AbnerSantos25](https://github.com/AbnerSantos25) | [Perfil](https://www.linkedin.com/in/abnerssantos/) |
| **Gabriel Lucas Oliveira Fernandes** | [GitHub](https://github.com/Se77ings) | [Perfil](https://www.linkedin.com/in/gabriel-lucas-oliveira-fernandes-6a2965159/) |

---

## 📞 Suporte

Para dúvidas, problemas ou sugestões:
- 📝 Abra uma [Issue](https://github.com/AbnerSantos25/TotemAtendimento/issues)
- 💬 Envie um email (adicione seu email)
- 🔔 Verifique as [Discussions](https://github.com/AbnerSantos25/TotemAtendimento/discussions)

---

## 🎓 Recursos Educacionais

- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [SOLID Principles - Microsoft Docs](https://docs.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles)
- [Entity Framework Core - Official Docs](https://docs.microsoft.com/en-us/ef/core/)
- [ASP.NET Core Best Practices](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/best-practices)
- [MediatR Documentation](https://github.com/jbogard/MediatR)

---

**Última atualização:** Dezembro de 2024  
**Versão:** 1.0.0
