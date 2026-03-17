export class RegisterDto {
  nombre: string;
  email: string;
  password: string;
  rol?: 'ADMIN' | 'COORDINADOR' | 'PROFESOR';
}
