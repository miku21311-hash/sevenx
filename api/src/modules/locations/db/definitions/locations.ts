import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { DEFAULT_CHECK_IN_RADIUS } from '@/common/checkIn';

export const sevenxLocationSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, required: true, label: 'Name' },
    address: { type: String, label: 'Address' },
    rooms: { type: [String], default: [], label: 'Rooms' },
    latitude: { type: Number, label: 'Latitude' },
    longitude: { type: Number, label: 'Longitude' },
    checkInRadius: {
      type: Number,
      default: DEFAULT_CHECK_IN_RADIUS,
      label: 'Check-in radius (m)',
    },
  },
  { timestamps: true },
);
