import { Document } from 'mongoose';
import { ISevenxAttachment } from '@/common/types';

export type SevenxChatSenderRole = 'teacher' | 'student' | 'supervisor';

export interface ISevenxChatMessage {
  classId: string;
  senderId: string;
  senderName: string;
  senderRole: SevenxChatSenderRole;
  body: string;
  attachments: ISevenxAttachment[];
}

export interface ISevenxChatMessageDocument extends ISevenxChatMessage, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
