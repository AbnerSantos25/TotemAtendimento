using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Totem.Common.Domain;
using Totem.Common.Domain.Entity;
using Totem.Common.Domain.Exceptions;
using Totem.Common.Localization.Resources;
using Totem.Common.ValueObject;

namespace Totem.Domain.Aggregates.ServiceTypeAggregate
{
	public class ServiceType : Entity, IAggregateRoot
	{
		public const int TitleMaxLength = 100;
		public const int IconMaxLength = 50;
		public const int TicketPrefixMaxLength = 3;

		public string Title { get; private set; }
		public string? Icon { get; private set; }
		public HexColor? Color { get; private set; }
		public string? TicketPrefix { get; private set; }
		public Guid TargetQueueId { get; private set; }
		public bool IsActive { get; private set; }

		private ServiceTypeValidation? _validations;
		[NotMapped, JsonIgnore]
		public ServiceTypeValidation Validations => _validations ??= new(this);

		protected ServiceType(){}

		public ServiceType(string title, string? icon, string? color, string? ticketPrefix, Guid targetQueueId)
		{
			if (!Validations.AllowedAdd(title, icon, color, ticketPrefix, targetQueueId))
				throw new DomainException(Errors.UnableCreateServiceType);

			Title = title;
			Icon = icon;
			Color = CreateColor(color);
			TicketPrefix = ticketPrefix;
			TargetQueueId = targetQueueId;
		}

		private HexColor? CreateColor(string? color)
		{
			if (color is null) return null;
			return new HexColor(color);
		}

		public void Update(string title, string? icon, string? color, Guid targetQueueId, string? ticketPrefix)
		{
			if (!IsValid || !Validations.AllowedUpdate(title, icon, color, ticketPrefix, targetQueueId))
				throw new DomainException(Errors.UnableUpdateServiceType);

			Title = title;
			Icon = icon;
			Color = CreateColor(color);
			TargetQueueId = targetQueueId;
			TicketPrefix = ticketPrefix;
		}

		public void ToggleStatus()
		{
			IsActive = !IsActive;
		}
	}
}
