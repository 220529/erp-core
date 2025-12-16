import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company, Department, User, Role, Menu, RoleMenu } from '../../entities';
import { PermissionModule } from '../permission/permission.module';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Department, User, Role, Menu, RoleMenu]),
    PermissionModule,
  ],
  controllers: [
    CompanyController,
    DepartmentController,
    UserController,
    RoleController,
  ],
  providers: [CompanyService, DepartmentService, UserService, RoleService],
  exports: [CompanyService, DepartmentService, UserService, RoleService],
})
export class SystemModule {}
