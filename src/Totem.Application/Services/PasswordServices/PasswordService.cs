﻿using Totem.Common.Domain.Notification;
using Totem.Common.Localization.Resources;
using Totem.Common.Services;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Models.PasswordModels;

namespace Totem.Application.Services.PasswordServices
{
    public class PasswordService : BaseService, IPasswordService
	{
        private readonly IPasswordRepository _passwordRepository;
        private readonly IPasswordQueries _passwordQueries;
        public PasswordService(INotificador notificador, IPasswordRepository passwordRepository, IPasswordQueries passwordQueries, PasswordValidations passwordValidation) : base(notificador)
        {
            _passwordRepository = passwordRepository;
            _passwordQueries = passwordQueries;
        }
        public async Task<(Result result, Guid data)> AddPasswordAsync(PasswordRequest request)
        {
            var password = new Password(request.QueueId,request.Preferential);
            if (!ExecuteValidation(new PasswordValidations(), password))
                return Unsuccessful<Guid>();

            password.IncrementCode(await _passwordRepository.GetNextPasswordCodeAsync());
            _passwordRepository.Add(password);

            if (!await _passwordRepository.UnitOfWork.CommitAsync())
                return Unsuccessful<Guid>(Errors.ErrorSavingDatabase.ToString());

            return Successful(password.Id);
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
