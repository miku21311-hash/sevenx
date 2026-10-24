import {
  distanceMeters,
  isValidLatitude,
  isValidLongitude,
  resolveCheckInWindow,
  statusForWindow,
} from '../checkIn';

const at = (time: string, seconds = 0) => {
  const [h, m] = time.split(':').map(Number);
  return new Date(2026, 9, 24, h, m, seconds);
};

const windowAt = (time: string, seconds = 0, start = '18:00', end = '19:30') =>
  resolveCheckInWindow('2026-10-24', start, end, at(time, seconds)).window;

describe('resolveCheckInWindow', () => {
  it('is early before start-30', () => {
    expect(windowAt('17:29', 59)).toBe('early');
  });

  it('counts present from start-30 to start+10 inclusive', () => {
    expect(windowAt('17:30')).toBe('present');
    expect(windowAt('18:00')).toBe('present');
    expect(windowAt('18:10')).toBe('present');
  });

  it('counts late after start+10 until end-20', () => {
    expect(windowAt('18:10', 1)).toBe('late');
    expect(windowAt('19:09', 59)).toBe('late');
  });

  it('counts absent in the last 20 minutes', () => {
    expect(windowAt('19:10')).toBe('absent');
    expect(windowAt('19:30')).toBe('absent');
  });

  it('is closed after the end', () => {
    expect(windowAt('19:30', 1)).toBe('closed');
  });

  it('lets the absent phase win in sessions too short for a late phase', () => {
    expect(windowAt('18:04', 0, '18:00', '18:25')).toBe('present');
    expect(windowAt('18:06', 0, '18:00', '18:25')).toBe('absent');
  });

  it('returns the window boundaries', () => {
    const info = resolveCheckInWindow('2026-10-24', '18:00', '19:30', at('18:00'));
    expect(info.opensAt).toEqual(at('17:30'));
    expect(info.presentUntil).toEqual(at('18:10'));
    expect(info.lateUntil).toEqual(at('19:10'));
    expect(info.closesAt).toEqual(at('19:30'));
  });
});

describe('statusForWindow', () => {
  it('maps only open windows to a status', () => {
    expect(statusForWindow('present')).toBe('present');
    expect(statusForWindow('late')).toBe('late');
    expect(statusForWindow('absent')).toBe('absent');
    expect(statusForWindow('early')).toBeNull();
    expect(statusForWindow('closed')).toBeNull();
    expect(statusForWindow('none')).toBeNull();
  });
});

describe('distanceMeters', () => {
  const central = { latitude: 47.9185, longitude: 106.9177 };

  it('is zero for the same point', () => {
    expect(distanceMeters(central, central)).toBe(0);
  });

  it('measures about 111 m per 0.001 degree of latitude', () => {
    const north = { latitude: central.latitude + 0.001, longitude: central.longitude };
    expect(distanceMeters(central, north)).toBeCloseTo(111.2, 0);
  });

  it('measures the two demo branches about 3.6 km apart', () => {
    const zaisan = { latitude: 47.8864, longitude: 106.9057 };
    const d = distanceMeters(central, zaisan);
    expect(d).toBeGreaterThan(3500);
    expect(d).toBeLessThan(3700);
  });
});

describe('coordinate validation', () => {
  it('accepts in-range numbers only', () => {
    expect(isValidLatitude(47.9)).toBe(true);
    expect(isValidLatitude(91)).toBe(false);
    expect(isValidLatitude(Number.NaN)).toBe(false);
    expect(isValidLongitude(-180)).toBe(true);
    expect(isValidLongitude(181)).toBe(false);
    expect(isValidLongitude('106')).toBe(false);
  });
});
