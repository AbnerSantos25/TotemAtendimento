using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Models.PasswordModels;

namespace Totem.Application.Services.PasswordServices
{
	public class PasswordService : BaseService, IPasswordService
	{
        private readonly INotificador _notificador;
        private readonly IPasswordRepository _passwordRepository;
        private readonly IPasswordQueries _passwordQueries;
        public PasswordService(INotificador notificador, IPasswordRepository passwordRepository, IPasswordQueries passwordQueries, PasswordValidations passwordValidation) : base(notificador)
        {
            _notificador = notificador;
            _passwordRepository = passwordRepository;
            _passwordQueries = passwordQueries;
        }
        public async Task<(Result result, Guid data)> AddPasswordAsync(PasswordRequest request)
        {
            var password = new Password(request.Code, request.QueueId, request.Preferential);
            if (!ExecuteValidation(new PasswordValidations(), password)) 
                return Unsuccessful<Guid>("Erro ao validar");

            _passwordRepository.Add(password);

            if (!await _passwordRepository.UnitOfWork.CommitAsync()) {
                return Unsuccessful<Guid>(Errors.ErrorSavingDatabase);
            }

            return Successful(password.Id);
        }

        public async Task<(bool result, PasswordView data)> GetByIdPasswordAsync(Guid id)
        {
            var password = await _passwordRepository.GetByIdAsync(id);
            if(password == null)
            {
                Notificar(Errors.PasswordNotFound);
                return (false, null);
            }

            return (true, password);
        }

        public async Task<(bool result, List<PasswordView> data)> GetListPasswordAsync()
        {
            var passwords = await _passwordQueries.GetListPasswordsAsync();
            return (true, passwords);
        }

        public async Task<bool> RemovePasswordAsync(Guid id)
        {
            var password = await _passwordRepository.GetByIdAsync(id);
            if (password == null)
            {
                Notificar(Errors.PasswordNotFound);
                return false;
            }

            _passwordRepository.Delete(password);
            return true;
        }
    }
}
