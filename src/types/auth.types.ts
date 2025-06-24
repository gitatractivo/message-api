export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenResponse {
  token: string;
  expiresIn: number;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse { 
  user: UserResponse | AdminResponse;
  token: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface CreateAdminInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
