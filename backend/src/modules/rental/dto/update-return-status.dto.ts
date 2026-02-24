import { IsIn } from 'class-validator';

export class UpdateReturnStatusDto {
  @IsIn(['returned'])
  status!: 'returned';
}
