namespace Totem.Common.Validation
{
	public class Contract : Notifiable
	{
		/// <summary>
		/// Começa uma nova cadeia de regras. As notificações gravadas pelo Apply() acumulam no mesmo contrato.
		/// </summary>
		public ValidationComposer Requires() => new(this);
	}
}
