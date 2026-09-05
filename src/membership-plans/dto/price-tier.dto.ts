import { IsNumber, IsString, Min, MinLength } from 'class-validator';

export class PriceTierDto {
  @IsString()
  @MinLength(1)
  label!: string;

  @IsNumber()
  @Min(0)
  price!: number;
}
