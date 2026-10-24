import { DEFAULT_CHECK_IN_RADIUS } from '@/common/checkIn';
import { ISevenxLocationDocument } from '@/locations/@types/locations';

// Locations created before check-in existed have no stored radius.
const checkInRadius = (doc: ISevenxLocationDocument) =>
  doc.checkInRadius ?? DEFAULT_CHECK_IN_RADIUS;

export const SevenxLocation = { checkInRadius };
