import { PartialType } from '@nestjs/mapped-types';
import { CreateMembershipPlanDto } from './create-membership-plan.dto.js';

export class UpdateMembershipPlanDto extends PartialType(CreateMembershipPlanDto) {}
