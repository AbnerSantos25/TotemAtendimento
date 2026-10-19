namespace Totem.Common.Domain.Exceptions
{
	/// <summary>
	/// Lançada pela guarda da entidade quando uma operação recebe dados inválidos. Vira 409 no GlobalExceptionMiddleware.
	/// </summary>
	public sealed class DomainException(string message) : Exception(message);
}
