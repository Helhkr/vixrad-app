import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { validateCpf } from '../utils/cpf.validator'; // We will create this file

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, cpf, name, crm, crmUf } = createUserDto;

    // Validate CPF format
    if (!validateCpf(cpf)) {
      throw new BadRequestException('CPF inválido.');
    }

    // Check for existing email
    const existingUserByEmail = await this.prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      throw new ConflictException('Email já registado.');
    }

    // Check for existing CPF
    const existingUserByCpf = await this.prisma.user.findFirst({ where: { cpf } });
    if (existingUserByCpf) {
      throw new ConflictException('CPF já registado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7 days trial

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        cpf,
        crm,
        crmUf,
        trialEndsAt,
        role: 'USER', // Default role
      },
      select: { id: true, email: true, name: true, role: true, crm: true, crmUf: true, trialEndsAt: true }, // Exclude password
    });

    const accessToken = this.jwtService.sign({ userId: user.id, email: user.email, role: user.role });

    return { user, accessToken };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const accessToken = this.jwtService.sign({ userId: user.id, email: user.email, role: user.role });

    return { accessToken };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, crm: true, crmUf: true, trialEndsAt: true, stripeCustomerId: true, subscriptionStatus: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    return user;
  }
}
