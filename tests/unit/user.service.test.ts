import { userService } from "../../src/services/user.service";
import { userRepository } from "../../src/repositories/user.repository";
import { ConflictError, NotFoundError } from "../../src/utils/AppError";

jest.mock("../../src/repositories/user.repository");

const mockedRepo = userRepository as jest.Mocked<typeof userRepository>;

describe("userService.create", () => {
  afterEach(() => jest.clearAllMocks());

  it("lanza ConflictError si el email ya existe", async () => {
    mockedRepo.findByEmail.mockResolvedValue({ id: "u1" } as any);

    await expect(
      userService.create({ email: "a@a.com", password: "12345678", role: "SELLER" })
    ).rejects.toThrow(ConflictError);
    expect(mockedRepo.create).not.toHaveBeenCalled();
  });

  it("crea el usuario con el roleId correcto y nunca expone passwordHash", async () => {
    mockedRepo.findByEmail.mockResolvedValue(null);
    mockedRepo.findRoleIdByName.mockResolvedValue("role-seller-id");
    mockedRepo.create.mockResolvedValue({
      id: "u1",
      email: "a@a.com",
      passwordHash: "hashed-value",
      status: "ACTIVE",
      createdAt: new Date(),
      role: { name: "SELLER" },
    } as any);

    const result = await userService.create({ email: "a@a.com", password: "12345678", role: "SELLER" });

    expect(mockedRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: "a@a.com", roleId: "role-seller-id" })
    );
    expect(result).not.toHaveProperty("passwordHash");
    expect(result.role).toBe("SELLER");
  });
});

describe("userService.getById", () => {
  afterEach(() => jest.clearAllMocks());

  it("lanza NotFoundError si el usuario no existe", async () => {
    mockedRepo.findById.mockResolvedValue(null);
    await expect(userService.getById("x")).rejects.toThrow(NotFoundError);
  });
});
