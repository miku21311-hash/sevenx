import { Model } from 'mongoose';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sevenxLocationSchema } from '@/locations/db/definitions/locations';
import {
  ISevenxLocation,
  ISevenxLocationDocument,
} from '@/locations/@types/locations';
import {
  DEFAULT_CHECK_IN_RADIUS,
  MAX_CHECK_IN_RADIUS,
  MIN_CHECK_IN_RADIUS,
  isValidLatitude,
  isValidLongitude,
} from '@/common/checkIn';

/** Validates and normalizes the check-in coordinates: both or neither, radius in range. */
const normalizeGeo = (doc: ISevenxLocation): ISevenxLocation => {
  const hasLat = doc.latitude !== undefined && doc.latitude !== null;
  const hasLng = doc.longitude !== undefined && doc.longitude !== null;
  if (hasLat !== hasLng) {
    throw new ExpectedError('Latitude and longitude must be set together', 'VALIDATION');
  }
  if (hasLat && !isValidLatitude(doc.latitude)) {
    throw new ExpectedError('Latitude must be between -90 and 90', 'VALIDATION');
  }
  if (hasLng && !isValidLongitude(doc.longitude)) {
    throw new ExpectedError('Longitude must be between -180 and 180', 'VALIDATION');
  }
  const radius = doc.checkInRadius ?? DEFAULT_CHECK_IN_RADIUS;
  if (!Number.isFinite(radius) || radius < MIN_CHECK_IN_RADIUS || radius > MAX_CHECK_IN_RADIUS) {
    throw new ExpectedError(
      `Check-in radius must be between ${MIN_CHECK_IN_RADIUS} and ${MAX_CHECK_IN_RADIUS} meters`,
      'VALIDATION',
    );
  }
  return {
    ...doc,
    rooms: doc.rooms || [],
    latitude: hasLat ? doc.latitude : null,
    longitude: hasLng ? doc.longitude : null,
    checkInRadius: Math.round(radius),
  };
};

export interface ISevenxLocationModel extends Model<ISevenxLocationDocument> {
  getLocation(_id: string): Promise<ISevenxLocationDocument>;
  createLocation(doc: ISevenxLocation): Promise<ISevenxLocationDocument>;
  updateLocation(_id: string, doc: ISevenxLocation): Promise<ISevenxLocationDocument>;
  removeLocation(_id: string): Promise<string>;
}

export const loadSevenxLocationClass = (models: IModels) => {
  class Location {
    public static async getLocation(_id: string) {
      const location = await models.Locations.findOne({ _id }).lean();
      if (!location) {
        throw new ExpectedError('Location not found', 'NOT_FOUND');
      }
      return location;
    }

    public static async createLocation(doc: ISevenxLocation) {
      if (!doc.name?.trim()) {
        throw new ExpectedError('Location name is required', 'VALIDATION');
      }
      return models.Locations.create(normalizeGeo(doc));
    }

    public static async updateLocation(_id: string, doc: ISevenxLocation) {
      await models.Locations.getLocation(_id);
      return models.Locations.findOneAndUpdate(
        { _id },
        { $set: normalizeGeo(doc) },
        { new: true },
      ).lean();
    }

    public static async removeLocation(_id: string) {
      const used = await models.Classes.countDocuments({ locationId: _id });
      if (used > 0) {
        throw new ExpectedError(
          'Location is used by classes and cannot be removed',
          'VALIDATION',
        );
      }
      await models.Locations.deleteOne({ _id });
      return _id;
    }
  }

  sevenxLocationSchema.loadClass(Location);
  return sevenxLocationSchema;
};
