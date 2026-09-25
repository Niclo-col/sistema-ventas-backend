import { Role } from "../middlewares/authContext";

export interface CreateUserDTO {
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserDTO {
  role?: Role;
  status?: "ACTIVE" | "INACTIVE";
}

export interface ListUserFilters {
  role?: Role;
  status?: "ACTIVE" | "INACTIVE";
  page: number;
  pageSize: number;
}

/** Forma pública de un usuario — nunca incluye passwordHash. */
export interface PublicUser {
  id: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
}
