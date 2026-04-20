# 🧪 Guia de Execução de Testes — Totem Atendimento

Este documento descreve como executar a suíte de testes do backend, organizada em três camadas: **Unitários**, **Integração** e **E2E Críticos**.

---

## 📁 Estrutura dos Projetos de Teste

```
tests/
├── Totem.UnitTests/          → Lógica de negócio isolada, sem IO ou banco de dados
├── Totem.IntegrationTests/   → Comportamento da API completa em memória (WebApplicationFactory)
└── Totem.E2ETests/           → Fluxos críticos ponta a ponta simulando chamadas HTTP reais
```

---

## ⚙️ Pré-requisitos

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9) instalado
- Estar na raiz do repositório: `c:\TotemAtendimento`

---

## 🚀 Executar Todos os Testes

Para rodar **toda a suíte de uma só vez**:

```bash
dotnet test
```

---

## 🔬 Executar por Camada

### Unitários
Testam regras de negócio de forma isolada com mocks (`Moq`). **Não precisam do banco de dados** nem da API rodando.

```bash
dotnet test tests/Totem.UnitTests/Totem.UnitTests.csproj
```

**O que é testado:**
- `HtmlSanitizerStringConverter` — garante que tags HTML/XSS são removidas antes de chegar no backend
- `ServiceTypeService` — regras de negócio de CRUD de tipos de serviço (delete, get, toggle)

---

### Integração
Testam o pipeline completo da API em memória usando `WebApplicationFactory<Program>`. **Não precisam de um servidor externo rodando**, mas precisam que a `Totem.API` compile corretamente.

```bash
dotnet test tests/Totem.IntegrationTests/Totem.IntegrationTests.csproj
```

**O que é testado:**
- `GlobalExceptionMiddleware` — garante que stack traces nunca são expostos ao cliente (CWE-209)
- `RateLimiting` — verifica que após 5 tentativas de login o servidor retorna `429 Too Many Requests` com mensagem amigável

---

### E2E Críticos
Testam fluxos completos de ponta a ponta, simulando o comportamento de um cliente HTTP real.

```bash
dotnet test tests/Totem.E2ETests/Totem.E2ETests.csproj
```

**O que é testado:**
- Login com credenciais inválidas retorna `400` sem vazar SQL ou stack trace
- Acesso a endpoints protegidos sem cookie retorna `401 Unauthorized`
- Registro com e-mail vazio é rejeitado com `400`
- Respostas não contêm headers que identificam o servidor (`X-Powered-By`, `Server: Kestrel`)

---

## 📊 Ver Resultado Detalhado

Para ver nome de cada teste e resultado individual:

```bash
dotnet test --verbosity normal
```

Para resultado ainda mais verboso (útil para debug):

```bash
dotnet test --verbosity detailed
```

---

## 🎯 Rodar um Teste Específico por Nome

```bash
dotnet test --filter "DisplayName~Rate Limit"
```

Ou por classe:

```bash
dotnet test --filter "ClassName=Totem.UnitTests.Security.HtmlSanitizerStringConverterTests"
```

---

## 📋 Convenção de Nomes

| Camada | Pasta | Sufixo dos arquivos |
|---|---|---|
| Unitário | `Totem.UnitTests/` | `*Tests.cs` |
| Integração | `Totem.IntegrationTests/` | `*Tests.cs` |
| E2E | `Totem.E2ETests/` | `*Tests.cs` |

---

## ✅ Regra de Ouro

> **Sempre que uma nova funcionalidade for implementada, pergunte ao responsável se um novo teste deve ser adicionado.**
> 
> A cobertura deve crescer junto com o projeto — nunca regredir.
