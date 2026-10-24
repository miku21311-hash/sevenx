import { Document } from 'mongoose';

export interface ISevenxLocation {
  name: string;
  address?: string;
  rooms: string[];
  latitude?: number | null;
  longitude?: number | null;
  checkInRadius?: number | null;
}

export interface ISevenxLocationDocument extends ISevenxLocation, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
