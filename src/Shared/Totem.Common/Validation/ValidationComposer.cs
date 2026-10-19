using Totem.Common.Domain.Notification;

namespace Totem.Common.Validation
{
	/// <summary>
	/// Monta uma cadeia de regras. Nada é gravado até o Apply().
	/// Modificadores (AddLabelArgument, AddArguments) e StopOnFailure agem sobre a última regra adicionada.
	/// </summary>
	public sealed class ValidationComposer
	{
		private sealed class Rule(bool failed, string message, IReadOnlyCollection<Notification>? inner)
		{
			public bool Failed { get; } = failed;
			public string Message { get; } = message;
			public IReadOnlyCollection<Notification>? Inner { get; } = inner;
			public List<object> Args { get; } = new();
		}

		private readonly Contract _contract;
		private readonly List<Rule> _rules = new();
		private bool _stopped;

		internal ValidationComposer(Contract contract) => _contract = contract;

		private Rule? Last => _rules.Count == 0 ? null : _rules[^1];

		private ValidationComposer Add(bool failed, string message, IReadOnlyCollection<Notification>? inner = null)
		{
			if (!_stopped) _rules.Add(new Rule(failed, message, inner));
			return this;
		}

		public ValidationComposer IsTrue(bool condition, string message) => Add(!condition, message);

		public ValidationComposer IsFalse(bool condition, string message) => Add(condition, message);

		public ValidationComposer IsNotNullOrEmpty(string? value, string message) => Add(string.IsNullOrWhiteSpace(value), message);

		public ValidationComposer IsNotEmpty(Guid value, string message) => Add(value == Guid.Empty, message);

		/// <summary>null passa; para campo obrigatório, combine com IsNotNullOrEmpty.</summary>
		public ValidationComposer HasMaxLength(string? value, int max, string message) => Add(value is not null && value.Length > max, message);

		/// <summary>null falha.</summary>
		public ValidationComposer HasLengthBetween(string? value, int min, int max, string message) =>
			Add(value is null || value.Length < min || value.Length > max, message);

		/// <summary>Falha se o outro contrato for inválido e copia as notificações dele, sem mensagem própria.</summary>
		public ValidationComposer IsValid(Notifiable other) => Add(!other.IsValid, string.Empty, other.Notifications.ToList());

		/// <summary>Adiciona um rótulo (ex.: Labels.Title) aos argumentos da última regra: {0}, {1}...</summary>
		public ValidationComposer AddLabelArgument(string label)
		{
			if (!_stopped) Last?.Args.Add(label);
			return this;
		}

		/// <summary>Adiciona argumentos literais aos argumentos da última regra.</summary>
		public ValidationComposer AddArguments(params object[] args)
		{
			if (!_stopped) Last?.Args.AddRange(args);
			return this;
		}

		/// <summary>Se a última regra falhou, ignora todas as regras seguintes da cadeia.</summary>
		public ValidationComposer StopOnFailure()
		{
			if (Last?.Failed == true) _stopped = true;
			return this;
		}

		/// <summary>As regras do bloco só são avaliadas se a condição for verdadeira.</summary>
		public ValidationComposer When(bool condition, Action<ValidationComposer> rules)
		{
			if (condition && !_stopped) rules(this);
			return this;
		}

		/// <summary>Grava no contrato as notificações das regras que falharam.</summary>
		public Contract Apply() => Apply(out _);

		/// <param name="isValid">Se esta cadeia passou, ignorando notificações anteriores do contrato.</param>
		public Contract Apply(out bool isValid)
		{
			isValid = true;
			foreach (var rule in _rules.Where(r => r.Failed))
			{
				if (rule.Inner is not null) _contract.AddNotifications(rule.Inner);
				else _contract.AddNotification(rule.Message, rule.Args.ToArray());
				isValid = false;
			}
			return _contract;
		}
	}
}
