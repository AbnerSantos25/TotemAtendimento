using System.Text.Json;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Infra.Data.Mappings;

namespace Totem.UnitTests.Domain;

// CreatedAt era gravado com DateTime.Now enquanto AssignedAt usava UtcNow, misturando
// fusos na mesma entidade. Ao padronizar em UTC surge uma armadilha: o SQL Server
// devolve datetime2 como Unspecified, e o System.Text.Json serializa Unspecified sem
// o sufixo "Z" -- o navegador entao le o horario UTC como se fosse local e mostra o
// valor deslocado. Estes testes travam as duas pontas.
public class PasswordDateTimeTests
{
    [Fact(DisplayName = "Senha nasce com CreatedAt em UTC")]
    public void Password_WhenCreated_ShouldUseUtc()
    {
        var password = new Password(Guid.NewGuid(), preferential: false);

        Assert.Equal(DateTimeKind.Utc, password.CreatedAt.Kind);
    }

    [Fact(DisplayName = "AssignedAt tambem fica em UTC ao atribuir guiche")]
    public void Password_WhenAssigned_ShouldUseUtc()
    {
        var password = new Password(Guid.NewGuid(), preferential: false);

        password.AssignToServiceLocation(Guid.NewGuid());

        Assert.NotNull(password.AssignedAt);
        Assert.Equal(DateTimeKind.Utc, password.AssignedAt!.Value.Kind);
    }

    [Fact(DisplayName = "Conversor reafirma UTC no valor lido do banco")]
    public void UtcConverter_ShouldMarkUnspecifiedValueAsUtc()
    {
        // Como o EF devolve o valor vindo do datetime2.
        var fromDatabase = new DateTime(2026, 9, 1, 17, 30, 0, DateTimeKind.Unspecified);

        var converted = PasswordMappings.UtcConverter.ConvertFromProvider(fromDatabase);

        Assert.NotNull(converted);
        Assert.Equal(DateTimeKind.Utc, ((DateTime)converted!).Kind);
    }

    [Fact(DisplayName = "Data em UTC chega ao cliente com o sufixo Z")]
    public void SerializedUtcDate_ShouldCarryZuluSuffix()
    {
        var fromDatabase = new DateTime(2026, 9, 1, 17, 30, 0, DateTimeKind.Unspecified);
        var converted = (DateTime)PasswordMappings.UtcConverter.ConvertFromProvider(fromDatabase)!;

        var json = JsonSerializer.Serialize(converted);

        // Sem o "Z" o navegador trataria 17:30 UTC como 17:30 local.
        Assert.EndsWith("Z\"", json);
    }

    [Fact(DisplayName = "Sem o conversor a data sairia sem fuso -- o bug que motivou a correcao")]
    public void SerializedUnspecifiedDate_ShouldNotCarryTimezone()
    {
        var fromDatabase = new DateTime(2026, 9, 1, 17, 30, 0, DateTimeKind.Unspecified);

        var json = JsonSerializer.Serialize(fromDatabase);

        Assert.DoesNotContain("Z", json);
        Assert.DoesNotContain("+", json);
    }
}
