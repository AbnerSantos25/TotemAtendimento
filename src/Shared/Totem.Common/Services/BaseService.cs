using FluentValidation;
using FluentValidation.Results;
using Totem.Common.Domain.Entity;
using Totem.Common.Domain.Notification;

namespace Totem.Common.Services
{
    public abstract class BaseService
    {

        private readonly INotificador _notificador;

        protected BaseService(INotificador notificador)
        {
            _notificador = notificador;
        }

        protected void Notificar(ValidationResult validationResult)
        {
            foreach (var error in validationResult.Errors)
            {
                Notificar(error.ErrorMessage);
            }
        }

        protected void Notificar(string mensagem)
        {
            _notificador.Handle(new Notificacao(mensagem));
        }

        protected bool ExecuteValidation<TV, TE>(TV validacao, TE entidade) where TV : AbstractValidator<TE> where TE : Entity
        {
            var validator = validacao.Validate(entidade);
            if (validator.IsValid) return true;
            Notificar(validator);
            return false;
        }

        protected Result Successful()
        {
            return new Result();
        }

        protected (Result result, T data) Successful<T>()
        {
            return (new Result(), default(T));
        }

        protected (Result result, T data) Successful<T>(T data)
        {
            return (new Result(), data);
        }

        protected Result Unsuccessful(List<Notificacao> notificacaos)
        {
            var result = new Result();
            result.AddNotifications(notificacaos);

            return result;
        }

        protected (Result result, T data) Unsuccessful<T>()
        {
            return (Unsuccessful(), default(T));
        }
        protected (Result result, T data) Unsuccessful<T>(string message)
        {
            return (Unsuccessful(message), default(T));
        }

        protected Result Unsuccessful(string message)
        {
            var result = new Result();
            result.Handle(new Notificacao(message));
            return result;
        }


        protected Result Unsuccessful()
        {
            var result = new Result();
            result.ObterNotificacoes();

            return result;
        }

    }

}
