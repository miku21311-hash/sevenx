import {
  IconDoor,
  IconLabelFilled,
  IconMapPin,
  IconMapPinCheck,
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
import { ISevenxLocation } from '~/modules/shared/types';
import {
  SevenxBulkDeleteBar,
  SevenxEmpty,
  sevenxMoreColumn,
} from '~/modules/shared/components';

interface LocationsTableProps {
  locations: ISevenxLocation[];
  loading: boolean;
  onEdit: (location: ISevenxLocation) => void;
  onRemove: (_id: string) => Promise<unknown>;
  onAdd: () => void;
  t: TFunction;
}

const buildColumns = ({
  onEdit,
  t,
}: Pick<LocationsTableProps, 'onEdit' | 't'>): ColumnDef<ISevenxLocation>[] => [
  sevenxMoreColumn<ISevenxLocation>(onEdit),
  RecordTable.checkboxColumn as ColumnDef<ISevenxLocation>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabelFilled} label={t('name')} />,
    size: 240,
    cell: ({ cell }) => (
      <RecordTableInlineCell
        onClick={() => onEdit(cell.row.original)}
        className="cursor-pointer"
      >
        <TextOverflowTooltip value={cell.getValue<string>()} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'address',
    accessorKey: 'address',
    header: () => <RecordTable.InlineHead icon={IconMapPin} label={t('address')} />,
    size: 280,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue<string | null>() ?? '—'} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'rooms',
    accessorKey: 'rooms',
    header: () => <RecordTable.InlineHead icon={IconDoor} label={t('rooms')} />,
    size: 320,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="gap-1 flex-wrap">
        {cell.getValue<string[]>().map((room) => (
          <Badge key={room} variant="secondary">
            {room}
          </Badge>
        ))}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'checkIn',
    accessorKey: 'checkInRadius',
    header: () => <RecordTable.InlineHead icon={IconMapPinCheck} label={t('check-in')} />,
    size: 160,
    cell: ({ row }) => {
      const { latitude, longitude, checkInRadius } = row.original;
      const ready = latitude != null && longitude != null;
      return (
        <RecordTableInlineCell>
          {ready ? (
            <Badge variant="success">{checkInRadius} m</Badge>
          ) : (
            <Badge variant="secondary">{t('check-in-off')}</Badge>
          )}
        </RecordTableInlineCell>
      );
    },
  },
];

export const LocationsTable = ({
  locations,
  loading,
  onEdit,
  onRemove,
  onAdd,
  t,
}: LocationsTableProps) => {
  if (!loading && locations.length === 0) {
    return (
      <SevenxEmpty
        icon={IconMapPin}
        title={t('no-locations-title')}
        description={t('no-locations-description')}
        className="h-full"
      >
        <Button onClick={onAdd}>{t('add-location')}</Button>
      </SevenxEmpty>
    );
  }

  return (
    <RecordTable.Provider
      columns={buildColumns({ onEdit, t })}
      data={locations}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
      tableId="sevenx_locations_table"
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          {loading && <RecordTable.RowSkeleton rows={8} />}
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
      <SevenxBulkDeleteBar
        onRemove={onRemove}
        successMessage={t('locations-removed')}
      />
    </RecordTable.Provider>
  );
};
