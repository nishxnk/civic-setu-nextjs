export type UserRole = "citizen" | "worker" | "admin";
export type AuthProvider = "email" | "google" | "legacy";

export interface IUser {
  _id: string;
  firebaseUid?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  photoURL?: string;
  authProvider: AuthProvider;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  token: string;
  role?: UserRole;
}

export interface IAuthContextValue {
  user: IAuthUser | null;
  loading: boolean;
  refreshToken: () => Promise<string | null>;
}
