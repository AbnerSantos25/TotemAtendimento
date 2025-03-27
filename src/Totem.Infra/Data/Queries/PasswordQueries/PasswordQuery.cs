using Microsoft.EntityFrameworkCore;
using Totem.Domain.Aggregates.PasswordAggregate;
using Totem.Domain.Models.PasswordModels;

namespace Totem.Infra.Data.Queries.PasswordQueries
{
    public class PasswordQuery : IPasswordQueries
    {
        private readonly TotemDbContext _context;

        public PasswordQuery(TotemDbContext context)
        {
            _context = context;
        }

        public async Task<List<PasswordView>> GetListPasswordsAsync()
        {
            var list = await _context.Passwords.ToListAsync();

            return list.Select(password => (PasswordView)password).ToList();
        }

    }
}
