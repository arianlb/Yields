import { IsString } from "class-validator";

export class CreateQqcatalystDto {
    @IsString()
    readonly startDate: string;

    @IsString()
    readonly endDate: string;
}
