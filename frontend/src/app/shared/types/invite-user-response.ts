import { UserDto } from "./user-dto";

export interface InviteUserResponse {
  message: string;
  user: UserDto;
}
