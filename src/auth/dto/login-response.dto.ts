import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description:
      'JWT access token. Gunakan sebagai Bearer token di header Authorization',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Waktu berlaku token dalam detik.',
    example: 3600,
  })
  expiresIn: number;
}
