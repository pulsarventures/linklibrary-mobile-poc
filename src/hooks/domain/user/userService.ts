import { authApiService } from '@/services/auth-api.service';
import { userSchema } from './schema';

export const UserServices = {
  fetchOne: async (id: number) => {
    const response = await authApiService.me();
    return userSchema.parse(response.user);
  },
};
