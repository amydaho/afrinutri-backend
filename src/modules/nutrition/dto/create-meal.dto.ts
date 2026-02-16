import { IsString, IsDateString, IsEnum } from 'class-validator';

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

export class CreateMealDto {
  @IsString()
  name: string;

  @IsDateString()
  date: string;

  @IsEnum(MealType)
  mealType: MealType;
}
