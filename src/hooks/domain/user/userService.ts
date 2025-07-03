import { AuthApiService } from '@/services/auth-api.service';
import { userSchema } from './schema';

export const UserServices = {
  fetchOne: async (id: number) => {
    const response = await AuthApiService.getUser();
    return userSchema.parse(response);
  },
};
