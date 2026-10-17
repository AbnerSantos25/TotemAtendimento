using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Totem.Common.API.Data
{
	/// <summary>
	/// Implementacao unica do commit transacional usado pelo <c>IUnitOfWork</c>.
	///
	/// Existe como extensao, e nao numa classe base, porque os dois contextos da
	/// aplicacao nao compartilham hierarquia: <c>AppIdentityDbContext</c> herda de
	/// <c>IdentityDbContext</c> e nao pode herdar de <c>SharedDbContext</c>. Antes,
	/// cada um mantinha a sua copia do metodo -- inclusive das mesmas falhas.
	/// </summary>
	public static class DbContextCommitExtensions
	{
		public static async Task<bool> CommitWithTransactionAsync(this DbContext context, ILogger logger)
		{
			await using var transaction = await context.Database.BeginTransactionAsync();

			try
			{
				var result = await context.SaveChangesAsync() > 0;

				if (result)
				{
					await transaction.CommitAsync();
				}
				else
				{
					await transaction.RollbackAsync();
				}

				return result;
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();
				logger.LogError(ex, "Falha ao confirmar a transacao no contexto {DbContext}.", context.GetType().Name);
				return false;
			}
		}
	}
}
