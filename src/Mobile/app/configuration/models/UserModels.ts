export interface UserView {
  id: string;
  name: string;
  email: string;
  isActive?: boolean;
  roles?: string[];
}

export interface UserRequest{
  FullName: string;
  email?: string;
  password?: string;
}