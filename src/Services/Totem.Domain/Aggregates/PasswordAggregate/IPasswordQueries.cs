using Totem.Domain.Models.PasswordModels;

namespace Totem.Domain.Aggregates.PasswordAggregate
{
    public interface IPasswordQueries
    {
        Task<List<PasswordView>> GetListPasswordsAsync();
    }
}
