export interface ServiceTypeView {
  serviceTypeId: string;
  title: string;
  icon?: string;
  color?: string;
  ticketPrefix?: string;
  targetQueueId: string;
}

export interface ServiceTypeSummary {
  serviceTypeId: string;
  title: string;
  icon?: string;
  color: string;
  ticketPrefix: string;
  targetQueueId: string;
  isActive: boolean;
}

export interface ServiceTypeRequest {
  title: string;
  icon?: string;
  color?: string;
  ticketPrefix?: string;
  targetQueueId: string;
}
