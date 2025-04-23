using MediatR;
using Totem.Application.Events;
using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.ServiceLocationAggregate;
using Totem.Domain.Models.PasswordModels;

namespace Totem.Application.Services.PasswordServices
{
    public class PasswordService : BaseService, IPasswordService
	{
        private readonly IPasswordRepository _passwordRepository;
        private readonly IPasswordQueries _passwordQueries;
        private readonly IServiceLocationRepository _serviceLocationRepository;
        private readonly IMediator _mediator;
        public PasswordService(INotificador notificador, IPasswordRepository passwordRepository, IPasswordQueries passwordQueries, PasswordValidations passwordValidation, IServiceLocationRepository serviceLocationRepository, IMediator mediator) : base(notificador)
        {
            _passwordRepository = passwordRepository;
            _passwordQueries = passwordQueries;
            _serviceLocationRepository = serviceLocationRepository;
            _mediator = mediator;
        }
        public async Task<(Result result, Guid data)> AddPasswordAsync(PasswordRequest request)
        {
            var password = new Password(request.QueueId,request.Preferential);
            if (!ExecuteValidation(new PasswordValidations(), password))
                return Unsuccessful<Guid>();

            password.IncrementCode(await _passwordRepository.GetNextPasswordCodeAsync());
            
            _passwordRepository.Add(password);

            try
            {
                if (!await _passwordRepository.UnitOfWork.CommitAsync())
                    return Unsuccessful<Guid>(Errors.ErrorSavingDatabase.ToString());
            }
            catch (Exception ex)
            {

            }

            await _mediator.Publish(new PasswordCreatedEvent(password.Id, password.QueueId));

            return Successful(password.Id);
        }

        public async Task<(Result result, PasswordView data)> AssignNextPasswordAsync(Guid queueId, Guid serviceLocationId)
        {
            var serviceLocation = await _serviceLocationRepository.GetByIdAsync(serviceLocationId);
            if (serviceLocation == null)
                return Unsuccessful<PasswordView>(Errors.NotFound); //Especificar no erro quem nao foi encontrado?

            var nextPassword = await _passwordRepository
                .GetNextUnassignedPasswordFromQueueAsync(queueId);

            if (nextPassword == null)
                return Successful<PasswordView>(null); // Não há senhas disponíveis na fila

            nextPassword.AssignToServiceLocation(serviceLocation.Id);

            _passwordRepository.Update(nextPassword);

            if (!await _passwordRepository.UnitOfWork.CommitAsync())
                return Unsuccessful<PasswordView>(Errors.ErrorSavingDatabase.ToString());
            
            await _mediator.Publish(new ServiceLocationReadyEvent(serviceLocationId, queueId));

            return Successful(nextPassword);
        }

        public async Task<(Result result, PasswordView data)> GetByIdPasswordAsync(Guid id)
        {
            var password = await _passwordRepository.GetByIdAsync(id);
            if (password == null)
                return Unsuccessful<PasswordView>(Errors.PasswordNotFound.ToString());
                

            return Successful(password);
        }

        public async Task<(Result result, List<PasswordView> data)> GetListPasswordAsync()
        {
            var passwords = await _passwordQueries.GetListPasswordsAsync();
            return Successful(passwords);
        }

        public async Task<Result> RemovePasswordAsync(Guid id)
        {
            var password = await _passwordRepository.GetByIdAsync(id);
            if (password == null)
                return Unsuccessful(Errors.PasswordNotFound.ToString());

            _passwordRepository.Delete(password);

            if (!await _passwordRepository.UnitOfWork.CommitAsync())
                return Unsuccessful(Errors.ErrorSavingDatabase.ToString());

            return Successful();
        }
    }
}
