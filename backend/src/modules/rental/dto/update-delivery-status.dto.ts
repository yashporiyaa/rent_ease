import { IsIn } from 'class-validator';

export class UpdateDeliveryStatusDto {
  @IsIn(['picked', 'pending'])
  status: 'picked' | 'pending';
}
