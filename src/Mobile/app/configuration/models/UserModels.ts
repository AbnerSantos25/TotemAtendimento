export interface UserRequest{
  name?: string;
  email?: string;
  password?: string;
  profileImageUrl?: string;
}
//TODO precisa criar no back uma estensao do IdentityUser com a propriedade do nome completo, também criar uma migration e depois rodar.
//assimr esovle o problema 