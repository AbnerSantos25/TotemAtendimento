export interface UserView {
  id: number;
  name: string;
  email: string;
  profileImageUrl: string;
}

export interface UserRequest{
  FullName: string;
  email?: string;
  password?: string;
  profileImageUrl?: string;
}