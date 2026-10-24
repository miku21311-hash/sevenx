import {
  IconBook2,
  IconCalendarEvent,
  IconChalkboard,
  IconClock,
  IconMapPin,
  IconProgressCheck,
  IconUsers,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  Button,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import type { TFunction } from 'i18next';
import { Link } from 'react-router-dom';
import { ISevenxClass, memberFullName } from '~/modules/shared/types';
import {
  SevenxBulkDeleteBar,
  SevenxEmpty,
  sevenxMoreColumn,
} from '~/modules/shared/components';
import { formatDateTime, scheduleLabel } from '~/modules/shared/utils/schedule';

interface ClassesTableProps {
  classes: ISevenxClass[];
  loading: boolean;
  onEdit: (classItem: ISevenxClass) => void;
  onRemove: (_id: string) => Promise<unknown>;
  onAdd: () => void;
  t: TFunction;
}

const buildColumns = (
  t: TFunction,
  onEdit: (c: ISevenxClass) => void,
): ColumnDef<ISevenxClass>[] => [
  sevenxMoreColumn<ISevenxClass>(onEdit),
  RecordTable.checkboxColumn as ColumnDef<ISevenxClass>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconBook2} label={t('name')} />,
    size: 240,
    cell: ({ cell, row }) => (
      <RecordTableInlineCell>
        <Link
          to={`/sevenx/classes/${row.original._id}`}
          className="text-primary hover:underline truncate"
        >
          {cell.getValue<string>()}
        </Link>
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'teacher',
    accessorFn: (row) => memberFullName(row.teacher),
    header: () => <RecordTable.InlineHead icon={IconChalkboard} label={t('teacher')} />,
    size: 180,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue<string>() || '—'} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'location',
    accessorFn: (row) =>
      [row.location?.name, row.room].filter(Boolean).join(' · ') || '—',
    header: () => <RecordTable.InlineHead icon={IconMapPin} label={t('location')} />,
    size: 200,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue<string>()} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'schedule',
    accessorFn: (row) => scheduleLabel(row.schedule, (day) => t(`day-${day}`)),
    header: () => <RecordTable.InlineHead icon={IconClock} label={t('schedule')} />,
    size: 220,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue<string>()} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'students',
    accessorFn: (row) => row.studentIds.length,
    header: () => <RecordTable.InlineHead icon={IconUsers} label={t('students-count')} />,
    size: 100,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue<number>()}</RecordTableInlineCell>
    ),
  },
  {
    id: 'nextSession',
    accessorFn: (row) => formatDateTime(row.nextSession),
    header: () => (
      <RecordTable.InlineHead icon={IconCalendarEvent} label={t('next-session')} />
    ),
    size: 160,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue<string>() || '—'}</RecordTableInlineCell>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead icon={IconProgressCheck} label={t('status')} />,
    size: 110,
    cell: ({ cell }) => {
      const status = cell.getValue<string>();
      return (
        <RecordTableInlineCell>
          <Badge variant={status === 'active' ? 'success' : 'secondary'}>
            {status === 'active' ? t('active') : t('archived')}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
];

export const ClassesTable = ({
  classes,
  loading,
  onEdit,
  onRemove,
  onAdd,
  t,
}: ClassesTableProps) => {
  if (!loading && classes.length === 0) {
    return (
      <SevenxEmpty
        icon={IconBook2}
        title={t('no-classes-title')}
        description={t('no-classes-description')}
        className="h-full"
      >
        <Button onClick={onAdd}>{t('add-class')}</Button>
      </SevenxEmpty>
    );
  }

  return (
    <RecordTable.Provider
      columns={buildColumns(t, onEdit)}
      data={classes}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
      tableId="sevenx_classes_table"
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          {loading && <RecordTable.RowSkeleton rows={10} />}
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
      <SevenxBulkDeleteBar
        onRemove={onRemove}
        successMessage={t('classes-removed')}
      />
    </RecordTable.Provider>
  );
};
