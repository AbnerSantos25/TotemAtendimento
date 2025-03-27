using Totem.Domain.Aggregates.QueueAggregate;
using Totem.Domain.Models.PasswordModels;

namespace Totem.Domain.Models.QueueModels
{
    public class QueueView
    {
        public string Name { get; set; }
        public bool Active { get; set; }
        public List<PasswordView> Passwords = new List<PasswordView>();

        public static implicit operator QueueView(Queue queue)
        {
            return new QueueView
            {
                Name = queue.Name,
                Active = queue.Active,
                Passwords = queue.Passwords.Select(p => (PasswordView)p).ToList()
            };
        }
    }
}
