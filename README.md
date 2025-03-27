# TotemAtendimento

Aqui iremos desenvolver um Totem para gerenciamento de filas de espera, onde buscamos sempre melhorar a qualidade e rapidez dos atendimentos de forma organizada e fluida. A principio esse sistema não será comercializado, estamos implementando a fins de estudos.


# Back-end

### **Tecnologias:**

- C#
- ASP NET Web API
- EntityFremeworkCore
- Dependencyinjection
- AutoMapper
- SQL Server
- FluetValidation

### Estrutura do projeto:

Entidades: 

### Entity

### Local Atendimento

```csharp

public class LocalAtendimento : Entity
{
    public string Nome { get; private set}
    public int? NumeroMesa { get; private set}
    
    public LocalAtendimento(string nome, int? numeroMesa = null)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new ArgumentException("O nome do local é obrigatório.", nameof(nome));

        Nome = nome;
        NumeroMesa = numeroMesa;
    }
}

```

### Fila De Espera

```csharp
public class FilaDeEspera : Entity
{
public string Nome { get; private set; }
public bool Ativo { get; private set; }
private readonly List<Senha> _senhas = new();
public IReadOnlyCollection<Senha> Senhas => _senhas.AsReadOnly();

public FilaDeEspera(string nome)
{
    Nome = nome;
    Ativo = true;
}

public void AdicionarSenha(Senha senha) => _senhas.Add(senha);

public void AlterarStatus(bool ativo) => Ativo = ativo;

}
```

### Senha

```csharp
public class Senha : Entity
{
    public string Codigo { get; private set; }
    public DateTime DataGeracao { get; private set; }
    public bool Atendida { get; private set; }
    public Guid IDLocalAtendimento { get; private set; }

    public Senha(string codigo)
    {
        Codigo = codigo;
        DataGeracao = DateTime.Now;
        Atendida = false;
    }

    public void MarcarComoAtendida() => Atendida = true;
}
```

### Usuário

Administrador

### Projetos

Criaremos uma pasta SRC → Serviços /  Shared /  Web

Services : 

- Application - Class Library
    - Configuration
        - DependencyInjection
    - Services
- Domain - Class Library
    - Aggregates
    - Models
- Infra - Class Library
    - Data
        - Repositories
        - Queries
        - DBContext
    - Mappings
- Presentation - ASP Net Web API
    - Controller

# Front-End:

**Tecnologias:** 

- React Native
- https://withfra.me/components
-
