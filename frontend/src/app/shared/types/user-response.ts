import { UserDto } from "./user-dto";

export interface UserResponse {
  message: string;
  user: UserDto;
}
