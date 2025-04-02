using Microsoft.EntityFrameworkCore;
using Totem.Common.Data;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Aggregates.ServiceLocationAggregate;

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
            return await _context.Passwords.Include(x=>x.ServiceLocation).SingleOrDefaultAsync(x => x.Id == id);
        }

        public void Update(Password password)
        {
            _context.Passwords.Update(password);
        }

        public async Task<int> GetNextPasswordCodeAsync()
        {
            // Busca o valor máximo atual da coluna Code na tabela Passwords.
            // Se não houver nenhum registro, retorna 0 e, em seguida, incrementa para 1.
            int currentMax = await _context.Passwords.MaxAsync(p => (int?)p.Code) ?? 0;
            return currentMax + 1;
        }
    }
}
