import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email("email inválido"),
    password: z.string().min(1, "password es requerido"),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "refreshToken es requerido"),
  }),
});
