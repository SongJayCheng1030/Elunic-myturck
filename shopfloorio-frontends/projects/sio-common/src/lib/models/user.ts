import { UserDto } from 'shared/common/models';

export interface UpdateUserDto {
  user: Partial<UserDto>;
  options: {
    sendResetPasswordMail: boolean;
    setPassword: boolean;
    password?: string;
  };
}
