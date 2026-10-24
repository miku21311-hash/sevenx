import dayjs from 'dayjs';

/** Monday-first order of `daysOfWeek` values (0 = Sunday … 6 = Saturday). */
export const WEEK_DAYS: number[] = [1, 2, 3, 4, 5, 6, 0];

export const DATE_FORMAT = 'YYYY-MM-DD';

export const formatDate = (value?: string | Date | null): string =>
  value ? dayjs(value).format(DATE_FORMAT) : '';

export const formatDateTime = (value?: string | null): string =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '';

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export const formatPercent = (rate: number): string =>
  `${Math.round(rate * 100)}%`;

/** Monday of the week containing `date`. */
export const startOfWeek = (date: dayjs.Dayjs): dayjs.Dayjs => {
  const day = date.day();
  const diff = day === 0 ? 6 : day - 1;
  return date.subtract(diff, 'day').startOf('day');
};

export const scheduleLabel = (
  schedule: { daysOfWeek: number[]; startTime: string; endTime: string },
  dayLabel: (day: number) => string,
): string => {
  const days = WEEK_DAYS.filter((d) => schedule.daysOfWeek.includes(d))
    .map(dayLabel)
    .join(', ');
  return `${days} ${schedule.startTime}–${schedule.endTime}`;
};

export interface TimedItem {
  start: number;
  end: number;
}

export interface OverlapSlot {
  /** Zero-based column inside the item's overlap cluster. */
  column: number;
  /** Number of columns in the cluster. */
  columns: number;
  /** Columns the item may fill, expanding right into free columns. */
  span: number;
}

const overlaps = (a: TimedItem, b: TimedItem) => a.start < b.end && b.start < a.end;

/**
 * Calendar-style side-by-side layout: items that transitively overlap form a
 * cluster; each gets the first free column (greedy by start time, longer
 * first) and expands right while no other item of the cluster is in the way.
 * Returned slots follow the order of `items`.
 */
export const layoutOverlaps = (items: TimedItem[]): OverlapSlot[] => {
  const slots: OverlapSlot[] = items.map(() => ({ column: 0, columns: 1, span: 1 }));
  const order = items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => a.item.start - b.item.start || b.item.end - a.item.end);

  const flush = (cluster: number[], columnEnds: number[]) => {
    const columns = columnEnds.length;
    cluster.forEach((index) => {
      const slot = slots[index];
      const blocked = new Set(
        cluster
          .filter((other) => other !== index && overlaps(items[other], items[index]))
          .map((other) => slots[other].column),
      );
      let span = 1;
      while (slot.column + span < columns && !blocked.has(slot.column + span)) {
        span += 1;
      }
      slot.columns = columns;
      slot.span = span;
    });
  };

  let cluster: number[] = [];
  let columnEnds: number[] = [];
  let clusterEnd = -Infinity;

  order.forEach(({ item, index }) => {
    if (item.start >= clusterEnd && cluster.length) {
      flush(cluster, columnEnds);
      cluster = [];
      columnEnds = [];
    }
    let column = columnEnds.findIndex((end) => end <= item.start);
    if (column === -1) {
      column = columnEnds.length;
      columnEnds.push(item.end);
    } else {
      columnEnds[column] = item.end;
    }
    slots[index].column = column;
    cluster.push(index);
    clusterEnd = cluster.length === 1 ? item.end : Math.max(clusterEnd, item.end);
  });
  if (cluster.length) flush(cluster, columnEnds);

  return slots;
};
