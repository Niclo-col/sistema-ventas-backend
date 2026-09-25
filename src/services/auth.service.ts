import { userRepository } from "../repositories/user.repository";
import { comparePassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { toPublicUser } from "../utils/userMapper";
import { NotFoundError, UnauthorizedError } from "../utils/AppError";
import { LoginDTO } from "../entities/auth.types";

export const authService = {
  async login(dto: LoginDTO) {
    const user = await userRepository.findByEmail(dto.email);

    // Mensaje genérico a propósito: no revela si el email existe o no.
    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const validPassword = await comparePassword(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const payload = { sub: user.id, role: user.role.name };

    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: toPublicUser(user),
    };
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Refresh token inválido o expirado");
    }

    const user = await userRepository.findById(payload.sub);
    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedError("El usuario ya no es válido");
    }

    const newPayload = { sub: user.id, role: user.role.name };
    return {
      accessToken: signAccessToken(newPayload),
      refreshToken: signRefreshToken(newPayload), // rotación
    };
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("Usuario no encontrado");
    return toPublicUser(user);
  },
};
