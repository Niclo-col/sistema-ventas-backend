import { PublicUser } from "../entities/user.types";

type UserWithRole = {
  id: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  role: { name: "ADMIN" | "SELLER" };
};

/** Nunca incluir passwordHash en una respuesta HTTP — este mapper es el único
 * punto de conversión de User (DB) a PublicUser (API). */
export function toPublicUser(user: UserWithRole): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role.name,
    status: user.status,
    createdAt: user.createdAt,
  };
}
