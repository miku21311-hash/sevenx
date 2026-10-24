import { loadSevenxAttendanceClass } from '../db/models/Attendances';

type Row = Record<string, unknown> | null;

const CENTRAL = { latitude: 47.9185, longitude: 106.9177 };

const cls = {
  _id: 'class1',
  locationId: 'loc1',
  status: 'active',
  studentIds: ['student1'],
  schedule: {
    daysOfWeek: [6],
    startTime: '18:00',
    endTime: '19:30',
    startDate: new Date(2026, 8, 1),
    endDate: new Date(2026, 11, 31),
  },
};

// Saturday 2026-10-24, server local time.
const at = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return new Date(2026, 9, 24, h, m);
};

const lean = <T>(value: T) => ({ lean: async () => value });

const setup = ({
  location = { _id: 'loc1', name: 'Central', ...CENTRAL, checkInRadius: 150 } as Row,
  existing = null as Row,
} = {}) => {
  const upserts: Record<string, unknown>[] = [];
  const models: Record<string, Record<string, unknown>> = {
    Locations: {
      findOne: () => lean(location),
      getLocation: async () => location,
    },
    Attendances: {},
  };
  const schema = loadSevenxAttendanceClass(models as never);
  const statics = schema.statics as Record<string, (...args: unknown[]) => Promise<unknown>>;
  Object.assign(models.Attendances, {
    checkInStatus: statics.checkInStatus,
    findOne: () => lean(existing),
    findOneAndUpdate: (_filter: unknown, update: { $set: Record<string, unknown> }) => {
      upserts.push(update.$set);
      return lean({ ...update.$set, studentId: 'student1' });
    },
  });
  const checkIn = (point = CENTRAL as Record<string, unknown>, now = at('17:45')) =>
    statics.checkIn(cls, 'student1', point, now) as Promise<Record<string, unknown>>;
  const status = (now: Date) =>
    statics.checkInStatus(cls, 'student1', now) as Promise<Record<string, unknown>>;
  return { checkIn, status, upserts };
};

describe('Attendances.checkIn', () => {
  it('records present, late and absent by server time', async () => {
    const { checkIn } = setup();
    expect((await checkIn(CENTRAL, at('17:30'))).status).toBe('present');
    expect((await checkIn(CENTRAL, at('18:30'))).status).toBe('late');
    expect((await checkIn(CENTRAL, at('19:15'))).status).toBe('absent');
  });

  it('stores the check-in time and rounded distance', async () => {
    const { checkIn, upserts } = setup();
    const near = { latitude: CENTRAL.latitude + 0.0005, longitude: CENTRAL.longitude };
    await checkIn(near, at('17:50'));
    expect(upserts[0]).toMatchObject({ status: 'present', checkInDistance: 56, markedBy: 'student1' });
    expect(upserts[0].checkedInAt).toEqual(at('17:50'));
  });

  it('rejects positions outside the radius', async () => {
    const { checkIn } = setup();
    const far = { latitude: 47.8864, longitude: 106.9057 };
    await expect(checkIn(far)).rejects.toThrow(/You are \d+ m from Central\. Check-in works within 150 m/);
  });

  it('rejects before the window opens and after it closes', async () => {
    const { checkIn } = setup();
    await expect(checkIn(CENTRAL, at('17:29'))).rejects.toThrow('Check-in opens at 17:30');
    await expect(checkIn(CENTRAL, at('19:31'))).rejects.toThrow('closed');
  });

  it('rejects when the location has no coordinates', async () => {
    const { checkIn } = setup({ location: { _id: 'loc1', name: 'Central', checkInRadius: 150 } });
    await expect(checkIn()).rejects.toThrow('not set up');
  });

  it('rejects a second check-in and an excused student', async () => {
    await expect(
      setup({ existing: { status: 'present', checkedInAt: at('17:40') } }).checkIn(),
    ).rejects.toThrow('already checked in');
    await expect(setup({ existing: { status: 'excused' } }).checkIn()).rejects.toThrow('excused');
  });

  it('lets a check-in replace a teacher default of absent', async () => {
    const { checkIn } = setup({ existing: { status: 'absent', markedBy: 'teacher1' } });
    expect((await checkIn()).status).toBe('present');
  });

  it('rejects imprecise positions', async () => {
    const { checkIn } = setup();
    await expect(checkIn({ ...CENTRAL, accuracy: 5000 })).rejects.toThrow('too imprecise');
  });
});

describe('Attendances.checkInStatus', () => {
  it('reports no session on other days', async () => {
    const { status } = setup();
    const result = await status(new Date(2026, 9, 23, 18, 0));
    expect(result).toMatchObject({ window: 'none', date: null, canCheckIn: false });
  });

  it('reports the open window and whether check-in is possible', async () => {
    const { status } = setup();
    expect(await status(at('18:05'))).toMatchObject({
      date: '2026-10-24',
      window: 'present',
      locationReady: true,
      checkInRadius: 150,
      canCheckIn: true,
    });
    expect(await status(at('17:00'))).toMatchObject({ window: 'early', canCheckIn: false });
  });
});
