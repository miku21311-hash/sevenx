import { Model } from 'mongoose';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sevenxChatMessageSchema } from '@/chat/db/definitions/chat';
import { ISevenxChatMessage, ISevenxChatMessageDocument } from '@/chat/@types/chat';

export const SEVENX_CHAT_MAX_LENGTH = 2000;
const MAX_LIMIT = 200;
export const SEVENX_CHAT_MAX_ATTACHMENTS = 10;

export interface ISevenxChatMessageModel extends Model<ISevenxChatMessageDocument> {
  listRecent(classId: string, limit?: number): Promise<ISevenxChatMessageDocument[]>;
  sendMessage(doc: ISevenxChatMessage): Promise<ISevenxChatMessageDocument>;
}

export const loadSevenxChatMessageClass = (models: IModels) => {
  class ChatMessage {
    /** Latest messages of a class, returned oldest first. */
    public static async listRecent(classId: string, limit = 100) {
      const size = Math.min(Math.max(limit, 1), MAX_LIMIT);
      const latest = await models.ChatMessages.find({ classId })
        .sort({ createdAt: -1 })
        .limit(size)
        .lean();
      return latest.reverse();
    }

    public static async sendMessage(doc: ISevenxChatMessage) {
      const body = doc.body?.trim() ?? '';
      const attachments = (doc.attachments ?? []).filter((a) => a?.url && a?.name);
      if (!body && attachments.length === 0) {
        throw new ExpectedError('Message is empty', 'VALIDATION');
      }
      if (attachments.length > SEVENX_CHAT_MAX_ATTACHMENTS) {
        throw new ExpectedError(
          `At most ${SEVENX_CHAT_MAX_ATTACHMENTS} attachments per message`,
          'VALIDATION',
        );
      }
      if (body.length > SEVENX_CHAT_MAX_LENGTH) {
        throw new ExpectedError(
          `Message is longer than ${SEVENX_CHAT_MAX_LENGTH} characters`,
          'VALIDATION',
        );
      }
      return models.ChatMessages.create({ ...doc, body, attachments });
    }
  }

  sevenxChatMessageSchema.loadClass(ChatMessage);
  return sevenxChatMessageSchema;
};
