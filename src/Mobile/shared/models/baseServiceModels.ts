import { UserView } from "./commonModels"

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  errors?: string[];
}
export interface ApiError {
  statusCode: number;
  message: string;
  body?: string;
  validationErrors?: Record<string, string[]>;
}

export interface AuthData {
  jwt: string;
  newToken: string;
  userView: UserView
}

export enum Status {
  loggedIn = 1,
  loggedOut
}

export type ServiceResult<T> = { success: true; data: T } | { success: false; error: ApiError };

export default null