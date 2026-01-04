import { ConflictException, Injectable } from "@nestjs/common";

import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async createUser(params: { email: string; passwordHash: string }) {
    const email = params.email.toLowerCase();

    try {
      return await this.prisma.user.create({
        data: {
          email,
          passwordHash: params.passwordHash,
        },
      });
    } catch (err: any) {
      // Unique constraint violation
      if (typeof err?.code === "string" && err.code === "P2002") {
        throw new ConflictException("Email já cadastrado");
      }
      throw err;
    }
  }
}
