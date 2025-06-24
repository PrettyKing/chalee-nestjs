import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetReposDto {
    @IsString()
    username: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @Max(100)
    per_page?: number = 30;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsString()
    sort?: 'created' | 'updated' | 'pushed' | 'full_name' = 'updated';

    @IsOptional()
    @IsString()
    direction?: 'asc' | 'desc' = 'desc';
}
