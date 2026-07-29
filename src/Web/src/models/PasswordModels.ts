import type { ServiceLocationView } from "./ServiceLocationModels";

export interface PasswordView {
    passwordId: string;
    code: number;
    createdAt: string;
    served: boolean;
    preferential: boolean;
    serviceLocation?: ServiceLocationView | null;
}

export interface PasswordRequest {
    queueId: string;
    preferential: boolean;
}

export interface PasswordTransferRequest {
    queueId: string;
    name: string;
}

export interface AttendanceDisplayView {
    passwordCode: string;
    serviceLocationName: string;
    queueName: string;
    index: number;
}
