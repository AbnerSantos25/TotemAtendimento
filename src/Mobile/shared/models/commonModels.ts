export interface UserView {
  id: string;
  name: string;
  email: string;
  isActive?: boolean;
  roles?: string[];
}