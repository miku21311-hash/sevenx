import dayjs from 'dayjs';
import {
  formatPercent,
  layoutOverlaps,
  scheduleLabel,
  startOfWeek,
  timeToMinutes,
  WEEK_DAYS,
} from '../schedule';

describe('schedule helpers', () => {
  it('converts HH:mm to minutes', () => {
    expect(timeToMinutes('18:30')).toBe(18 * 60 + 30);
    expect(timeToMinutes('00:00')).toBe(0);
  });

  it('finds the Monday of the week, also on Sunday', () => {
    expect(startOfWeek(dayjs('2026-10-21')).format('YYYY-MM-DD')).toBe('2026-10-19');
    expect(startOfWeek(dayjs('2026-10-25')).format('YYYY-MM-DD')).toBe('2026-10-19');
    expect(startOfWeek(dayjs('2026-10-19')).format('YYYY-MM-DD')).toBe('2026-10-19');
  });

  it('labels a schedule Monday-first', () => {
    const label = scheduleLabel(
      { daysOfWeek: [0, 1, 3], startTime: '18:00', endTime: '19:30' },
      (day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
    );
    expect(label).toBe('Mon, Wed, Sun 18:00–19:30');
    expect(WEEK_DAYS[0]).toBe(1);
    expect(WEEK_DAYS[6]).toBe(0);
  });

  it('formats rates as whole percents', () => {
    expect(formatPercent(0.874)).toBe('87%');
    expect(formatPercent(0)).toBe('0%');
  });

  it('lays overlapping items out side by side', () => {
    const m = (time: string) => timeToMinutes(time);
    // Math 16:00–17:30, Hackathon 16:00–20:00, IELTS 18:00–19:30, Late 21:00–22:00
    const slots = layoutOverlaps([
      { start: m('16:00'), end: m('17:30') },
      { start: m('16:00'), end: m('20:00') },
      { start: m('18:00'), end: m('19:30') },
      { start: m('21:00'), end: m('22:00') },
    ]);
    expect(slots).toEqual([
      { column: 1, columns: 2, span: 1 },
      { column: 0, columns: 2, span: 1 },
      { column: 1, columns: 2, span: 1 },
      { column: 0, columns: 1, span: 1 },
    ]);
  });

  it('expands an item into free columns to its right', () => {
    // A 9–12 and B 9–10 and C 9–10 fill three columns; D 10–11 sits next to A and may use column 2 too.
    const slots = layoutOverlaps([
      { start: 540, end: 720 },
      { start: 540, end: 600 },
      { start: 540, end: 600 },
      { start: 600, end: 660 },
    ]);
    expect(slots[0]).toEqual({ column: 0, columns: 3, span: 1 });
    expect(slots[3]).toEqual({ column: 1, columns: 3, span: 2 });
  });

  it('treats touching items as not overlapping', () => {
    expect(
      layoutOverlaps([
        { start: 540, end: 600 },
        { start: 600, end: 660 },
      ]),
    ).toEqual([
      { column: 0, columns: 1, span: 1 },
      { column: 0, columns: 1, span: 1 },
    ]);
  });
});
