namespace Totem.Application.Services.PasswordMatchingServices
{
	/// <summary>
	/// Guarda, por fila, os guiches que pediram uma senha e ficaram sem atendimento.
	/// O estado e efemero e compartilhado por toda a aplicacao, entao a implementacao
	/// e registrada como Singleton e precisa ser segura para acesso concorrente.
	/// </summary>
	public interface IWaitingServiceLocationStore
	{
		/// <summary>Coloca o guiche no fim da espera da fila, ignorando duplicatas.</summary>
		void Enqueue(Guid queueId, Guid serviceLocationId);

		/// <summary>Retira o guiche que espera ha mais tempo na fila informada.</summary>
		bool TryDequeue(Guid queueId, out Guid serviceLocationId);

		/// <summary>Tira o guiche da espera, usado quando ele deixa de aguardar.</summary>
		void Remove(Guid queueId, Guid serviceLocationId);

		/// <summary>Tira o guiche de qualquer fila em que esteja esperando, usado quando ele e excluido.</summary>
		void RemoveServiceLocation(Guid serviceLocationId);

		/// <summary>Esvazia a espera de uma fila, usada quando ela e excluida ou desativada.</summary>
		void ClearQueue(Guid queueId);
	}
}
