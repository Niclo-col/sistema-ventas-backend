import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email("email inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    role: z.enum(["ADMIN", "SELLER"]),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string().uuid("id inválido") }),
  body: z
    .object({
      role: z.enum(["ADMIN", "SELLER"]).optional(),
      status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, "Debe enviar al menos un campo para actualizar"),
});

export const userIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid("id inválido") }),
});

export const listUsersQuerySchema = z.object({
  query: z.object({
    role: z.enum(["ADMIN", "SELLER"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  }),
});
