import { IContext } from '~/connectionResolvers';
import { ISevenxAttachment } from '@/common/types';
import { requireClassAccess, shared, SevenxResolver } from '@/common/auth';

export const sevenxChatMutations: Record<string, SevenxResolver> = {
  sevenxChatMessageSend: shared(
    async (
      _root,
      { classId, body, attachments }: { classId: string; body?: string; attachments?: ISevenxAttachment[] },
      context: IContext,
    ) => {
      const { actor } = await requireClassAccess(context, classId);
      return context.models.ChatMessages.sendMessage({
        classId,
        body: body ?? '',
        attachments: attachments ?? [],
        senderId: actor.kind === 'supervisor' ? actor.userId : actor.member._id,
        senderName: actor.name,
        senderRole: actor.kind === 'supervisor' ? 'supervisor' : actor.member.role,
      });
    },
  ),
};
