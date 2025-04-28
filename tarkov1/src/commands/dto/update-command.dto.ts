import { PartialType } from '@nestjs/mapped-types';
import { CreateCommandDto } from './create-command.dto';

export class UpdateCommandDto extends PartialType(CreateCommandDto) {} 