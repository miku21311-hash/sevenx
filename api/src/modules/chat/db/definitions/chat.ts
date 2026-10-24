import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { attachmentSchema } from '@/common/attachments';

export const sevenxChatMessageSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    classId: { type: String, required: true, label: 'Class' },
    senderId: { type: String, required: true, label: 'Sender' },
    senderName: { type: String, required: true, label: 'Sender name' },
    senderRole: {
      type: String,
      enum: ['teacher', 'student', 'supervisor'],
      required: true,
      label: 'Sender role',
    },
    body: { type: String, default: '', label: 'Body' },
    attachments: { type: [attachmentSchema], default: [], label: 'Attachments' },
  },
  { timestamps: true },
);

sevenxChatMessageSchema.index({ classId: 1, createdAt: -1 });
