import { ApiProperty } from '@nestjs/swagger';

export class ResObjDto<T> {
  @ApiProperty()
  readonly data: T | T[];

  @ApiProperty()
  readonly statusCode: number;

  @ApiProperty()
  readonly message: string;

  constructor(data: T | T[], statusCode = 200, message = '') {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
