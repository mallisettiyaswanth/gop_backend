import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateMemberDto } from './create-member.dto.js';
import { MemberStatus } from '../../generated/prisma/enums.js';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;
}
