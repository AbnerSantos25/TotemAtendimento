export interface ServiceTypeView {
  serviceTypeId: string;
  title: string;
  icon?: string | null;
  color?: string | null;
  ticketPrefix?: string | null;
  targetQueueId: string;
}

export interface ServiceTypeSummary {
  serviceTypeId: string;
  title: string;
  icon?: string | null;
  color: string;
  ticketPrefix: string | null;
  targetQueueId: string;
  isActive: boolean;
}

export interface ServiceTypeRequest {
  title: string;
  icon?: string | null;
  color?: string | null;
  ticketPrefix?: string | null;
  targetQueueId: string;
}
