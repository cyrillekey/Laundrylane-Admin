interface DefaultResponse {
  id?: number;
  success: boolean;
  message: string;
}

interface AuthResponse {
  id?: number;
  success: boolean;
  message: string;
  token?: string;
  user?: IUser;
}

export interface IUser {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  lastLoginDate: Date;
  dateOfBirth: Date;
  userName: string;
  gender: string;
  avatar: string;
  createdat: string;
  updatedat: string;
}
