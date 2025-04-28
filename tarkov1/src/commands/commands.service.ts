import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommandDto } from './dto/create-command.dto';
import { UpdateCommandDto } from './dto/update-command.dto';

@Injectable()
export class CommandsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCommandDto: CreateCommandDto) {
    return this.prisma.command.create({
      data: createCommandDto,
    });
  }

  async findAll() {
    return this.prisma.command.findMany();
  }

  async findOne(id: string) {
    const command = await this.prisma.command.findUnique({
      where: { id },
    });
    if (!command) {
      throw new NotFoundException(`Command with ID ${id} not found`);
    }
    return command;
  }

  async update(id: string, updateCommandDto: UpdateCommandDto) {
    const command = await this.findOne(id);
    return this.prisma.command.update({
      where: { id: command.id },
      data: updateCommandDto,
    });
  }

  async remove(id: string) {
    const command = await this.findOne(id);
    return this.prisma.command.delete({
      where: { id: command.id },
    });
  }

  async executeCommand(name: string, userId: string) {
    const command = await this.prisma.command.findFirst({
      where: {
        name,
        userId,
        enabled: true,
      },
    });
    if (!command) {
      throw new NotFoundException(`Command ${name} not found or disabled`);
    }
    return command.response;
  }
} 