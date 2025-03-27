using Microsoft.EntityFrameworkCore;
using Totem.Common.Data;
using Totem.Domain.Aggregates.PasswordAggregate;

namespace Totem.Infra.Data.Repositories.PasswordRepository
{
    public class PasswordRepository : IPasswordRepository
    {
        private readonly TotemDbContext _context;

        public PasswordRepository(TotemDbContext context)
        {
            _context = context;
        }

        public IUnitOfWork UnitOfWork => _context;
        public void Dispose()
        {
            _context.Dispose();
        }

        public void Add(Password password)
        {
            _context.Passwords.Add(password);
        }

        public void Delete(Password password)
        {
            _context.Passwords.Remove(password);
        }


        public async Task<Password> GetByIdAsync(Guid id)
        {
            return await _context.Passwords.SingleOrDefaultAsync(x => x.Id == id);
        }

        public void Update(Password password)
        {
            _context.Passwords.Update(password);
        }
    }
}
