import { IsInt, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class PriceTierDto {
  @IsString()
  @MinLength(1)
  label!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  /** How many days a purchase of this tier keeps the membership valid for. */
  @IsInt()
  @Min(1)
  durationDays!: number;
}
