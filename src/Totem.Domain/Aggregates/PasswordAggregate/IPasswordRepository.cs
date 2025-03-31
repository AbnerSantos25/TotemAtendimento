using static Totem.Common.Data.IRepository;

namespace Totem.Domain.Aggregates.PasswordAggregate
{
    public interface IPasswordRepository : IRepository<Password>
    {
        Task<Password> GetByIdAsync(Guid id);
        void Add(Password password);
        void Update(Password password);
        void Delete(Password password);
    }
}
