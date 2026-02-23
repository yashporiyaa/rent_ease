import { IsIn } from 'class-validator';

export class UpdateReturnStatusDto {
  @IsIn(['picked', 'returned', 'pending'])
  status!: 'picked' | 'returned' | 'pending';
}
