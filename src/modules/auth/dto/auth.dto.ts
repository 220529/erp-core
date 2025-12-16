import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: '姓名' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '手机号' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiPropertyOptional({ description: '角色标识(admin/designer/foreman/finance)' })
  @IsString()
  @IsOptional()
  role?: string;
}

