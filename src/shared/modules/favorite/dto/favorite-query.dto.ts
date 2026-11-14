import { IsMongoId } from 'class-validator';

export class FavoriteQueryDto {
  @IsMongoId()
  public userId!: string;
}
