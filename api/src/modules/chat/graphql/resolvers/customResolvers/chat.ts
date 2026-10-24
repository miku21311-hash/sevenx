import { ISevenxChatMessageDocument } from '@/chat/@types/chat';

export const SevenxChatMessage = {
  // Messages stored before attachments existed have no field; lean reads skip schema defaults.
  attachments(message: ISevenxChatMessageDocument) {
    return message.attachments ?? [];
  },
};
