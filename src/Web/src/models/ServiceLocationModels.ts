export interface ServiceLocationView {
    id: string;
    name: string;
    number?: number | null;
}

export interface ServiceLocationRequest {
    name: string;
    number?: number | null;
}

export interface ServiceLocationReadyRequest {
    queueId: string;
    name: string;
}
