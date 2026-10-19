using Totem.Common.Validation;

namespace Totem.UnitTests.Validation;

public class ValidationComposerTests
{
    private static string[] Messages(Notifiable n) => n.Notifications.Select(x => x.Message).ToArray();

    [Fact(DisplayName = "Cada regra passa com valor válido e falha com inválido")]
    public void Rules_PassAndFail()
    {
        var ok = new Contract();
        ok.Requires()
            .IsTrue(true, "a").IsFalse(false, "b")
            .IsNotNullOrEmpty("x", "c").IsNotEmpty(Guid.NewGuid(), "d")
            .HasMaxLength("abc", 3, "e").HasLengthBetween("abc", 1, 3, "f")
            .Apply();
        Assert.True(ok.IsValid);

        var bad = new Contract();
        bad.Requires()
            .IsTrue(false, "a").IsFalse(true, "b")
            .IsNotNullOrEmpty("  ", "c").IsNotEmpty(Guid.Empty, "d")
            .HasMaxLength("abcd", 3, "e").HasLengthBetween("", 1, 3, "f")
            .Apply();
        Assert.Equal(new[] { "a", "b", "c", "d", "e", "f" }, Messages(bad));
    }

    [Fact(DisplayName = "HasMaxLength aceita null e HasLengthBetween recusa")]
    public void Null_Handling()
    {
        var c = new Contract();
        c.Requires().HasMaxLength(null, 3, "max").HasLengthBetween(null, 1, 3, "between").Apply();
        Assert.Equal(new[] { "between" }, Messages(c));
    }

    [Fact(DisplayName = "Sem Apply() nada é gravado")]
    public void WithoutApply_NothingIsRecorded()
    {
        var c = new Contract();
        c.Requires().IsTrue(false, "erro");
        Assert.True(c.IsValid);
    }

    [Fact(DisplayName = "Apply(out isValid) reflete só a cadeia atual")]
    public void ApplyOut_ReflectsCurrentChainOnly()
    {
        var c = new Contract();
        c.Requires().IsTrue(false, "antiga").Apply(out var first);
        c.Requires().IsTrue(true, "nova").Apply(out var second);

        Assert.False(first);
        Assert.True(second);
        Assert.False(c.IsValid);
    }

    [Fact(DisplayName = "AddLabelArgument e AddArguments preenchem {0} e {1} na ordem")]
    public void Arguments_FillPlaceholdersInOrder()
    {
        var c = new Contract();
        c.Requires()
            .HasMaxLength("abcd", 3, "{0} até {1}")
                .AddLabelArgument("Título").AddArguments(3)
            .Apply();
        Assert.Equal(new[] { "Título até 3" }, Messages(c));
    }

    [Fact(DisplayName = "Modificador sem regra anterior não faz nada")]
    public void Modifier_WithoutRule_DoesNothing()
    {
        var c = new Contract();
        c.Requires().AddLabelArgument("solto").StopOnFailure().IsTrue(false, "{0}").AddArguments("x").Apply();
        Assert.Equal(new[] { "x" }, Messages(c));
    }

    [Fact(DisplayName = "StopOnFailure após falha ignora as regras seguintes")]
    public void StopOnFailure_AfterFailure_SkipsRest()
    {
        var c = new Contract();
        c.Requires()
            .IsTrue(false, "primeira").StopOnFailure()
            .IsTrue(false, "segunda").AddArguments("x")
            .When(true, r => r.IsTrue(false, "terceira"))
            .Apply();
        Assert.Equal(new[] { "primeira" }, Messages(c));
    }

    [Fact(DisplayName = "StopOnFailure após regra válida não interrompe")]
    public void StopOnFailure_AfterSuccess_Continues()
    {
        var c = new Contract();
        c.Requires().IsTrue(true, "primeira").StopOnFailure().IsTrue(false, "segunda").Apply();
        Assert.Equal(new[] { "segunda" }, Messages(c));
    }

    [Fact(DisplayName = "When(false) não avalia o bloco")]
    public void When_False_DoesNotEvaluate()
    {
        string? value = null;
        var c = new Contract();
        c.Requires()
            .When(value is not null, r => r.IsTrue(value!.Length > 0, "nunca"))
            .When(true, r => r.IsTrue(false, "sempre"))
            .Apply();
        Assert.Equal(new[] { "sempre" }, Messages(c));
    }

    [Fact(DisplayName = "IsValid(outro) copia as notificações sem duplicar")]
    public void IsValid_CopiesWithoutDuplicating()
    {
        var inner = new Contract();
        inner.Requires().IsTrue(false, "a").IsTrue(false, "b").Apply();

        var outer = new Contract();
        outer.Requires().IsValid(inner).IsValid(new Contract()).Apply();
        Assert.Equal(new[] { "a", "b" }, Messages(outer));
    }
}
