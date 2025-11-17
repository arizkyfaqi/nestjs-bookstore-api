import { ApiProperty } from '@nestjs/swagger';

export class ResMsgDto {
  @ApiProperty()
  readonly statusCode: number;

  @ApiProperty()
  readonly message: string;

  constructor(statusCode = 200, message: string) {
    this.statusCode = statusCode;
    this.message = message;
  }
}
