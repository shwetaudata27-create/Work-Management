export type Role = "admin" | "employee";

export interface User {
  id?: number;
  username: string;
  name: string;
  role: Role;
  type?: string;
}
