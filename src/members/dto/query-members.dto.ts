import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const SORTABLE_FIELDS = ['memberCode', 'name', 'phone', 'email', 'status', 'joinDate', 'createdAt'] as const;
export type MemberSortField = (typeof SORTABLE_FIELDS)[number];

export class QueryMembersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit: number = 10;

  @IsOptional()
  @IsIn(SORTABLE_FIELDS)
  sortBy?: MemberSortField;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';

  /** Matches against name, phone, email, or member code. */
  @IsOptional()
  @IsString()
  search?: string;

  /** Comma-separated MemberStatus values, e.g. "ACTIVE,EXPIRING_SOON". */
  @IsOptional()
  @IsString()
  status?: string;

  /** Only members with an active membership on this plan. */
  @IsOptional()
  @IsString()
  planId?: string;
}
