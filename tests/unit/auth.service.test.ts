import { authService } from "../../src/services/auth.service";
import { userRepository } from "../../src/repositories/user.repository";
import { comparePassword } from "../../src/utils/password";
import { UnauthorizedError } from "../../src/utils/AppError";

jest.mock("../../src/repositories/user.repository");
jest.mock("../../src/utils/password");

const mockedUserRepo = userRepository as jest.Mocked<typeof userRepository>;
const mockedComparePassword = comparePassword as jest.MockedFunction<typeof comparePassword>;

const activeUser = {
  id: "u1",
  email: "admin@test.dev",
  passwordHash: "hashed",
  status: "ACTIVE" as const,
  createdAt: new Date(),
  role: { name: "ADMIN" as const },
};

describe("authService.login", () => {
  afterEach(() => jest.clearAllMocks());

  it("lanza UnauthorizedError si el usuario no existe (sin revelar el motivo)", async () => {
    mockedUserRepo.findByEmail.mockResolvedValue(null);
    await expect(authService.login({ email: "x@x.com", password: "123" })).rejects.toThrow(
      UnauthorizedError
    );
  });

  it("lanza UnauthorizedError si el usuario está INACTIVE", async () => {
    mockedUserRepo.findByEmail.mockResolvedValue({ ...activeUser, status: "INACTIVE" } as any);
    await expect(authService.login({ email: activeUser.email, password: "123" })).rejects.toThrow(
      UnauthorizedError
    );
  });

  it("lanza UnauthorizedError si la contraseña es incorrecta", async () => {
    mockedUserRepo.findByEmail.mockResolvedValue(activeUser as any);
    mockedComparePassword.mockResolvedValue(false);

    await expect(authService.login({ email: activeUser.email, password: "wrong" })).rejects.toThrow(
      UnauthorizedError
    );
  });

  it("retorna tokens y el usuario público si las credenciales son correctas", async () => {
    mockedUserRepo.findByEmail.mockResolvedValue(activeUser as any);
    mockedComparePassword.mockResolvedValue(true);

    const result = await authService.login({ email: activeUser.email, password: "correct" });

    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(result.user).toEqual(
      expect.objectContaining({ id: "u1", email: activeUser.email, role: "ADMIN" })
    );
    expect((result.user as any).passwordHash).toBeUndefined();
  });
});
