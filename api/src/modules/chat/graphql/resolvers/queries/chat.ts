import { IContext } from '~/connectionResolvers';
import { requireClassAccess, shared, SevenxResolver } from '@/common/auth';

export const sevenxChatQueries: Record<string, SevenxResolver> = {
  sevenxChatMessages: shared(
    async (_root, { classId, limit }: { classId: string; limit?: number }, context: IContext) => {
      await requireClassAccess(context, classId);
      return context.models.ChatMessages.listRecent(classId, limit || 100);
    },
  ),
};
