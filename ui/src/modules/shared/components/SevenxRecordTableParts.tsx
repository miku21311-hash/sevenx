import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/table-core';
import {
  Button,
  Combobox,
  Command,
  CommandBar,
  Popover,
  RecordTable,
  Separator,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';

interface SevenxRecord {
  _id: string;
}

/**
 * First column of every 7x table, like core's client portal users: a
 * horizontal "…" button whose menu only offers Edit (removal lives in the
 * bulk bar and the detail view).
 */
export const sevenxMoreColumn = <T extends SevenxRecord>(
  onEdit: (row: T) => void,
): ColumnDef<T> => ({
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  size: 33,
  cell: ({ cell }: { cell: Cell<T, unknown> }) => (
    <SevenxMoreCell onEdit={() => onEdit(cell.row.original)} />
  ),
});

const SevenxMoreCell = ({ onEdit }: { onEdit: () => void }) => {
  const { t } = useTranslation('sevenx');
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() => {
                setOpen(false);
                onEdit();
              }}
            >
              <IconEdit /> {t('edit')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

/** Removes several records with a single-id mutation; resolves to the failures. */
export const removeEach = async (
  ids: string[],
  remove: (_id: string) => Promise<unknown>,
): Promise<unknown[]> => {
  const results = await Promise.allSettled(ids.map((_id) => remove(_id)));
  return results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map((r) => r.reason);
};

interface SevenxBulkDeleteBarProps {
  onRemove: (_id: string) => Promise<unknown>;
  successMessage: string;
}

/** Floating "N selected · Delete" bar; must render inside `RecordTable.Provider`. */
export const SevenxBulkDeleteBar = ({
  onRemove,
  successMessage,
}: SevenxBulkDeleteBarProps) => {
  const { t } = useTranslation('sevenx');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const toast = useSevenxToast();
  const [loading, setLoading] = useState(false);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const ids = selectedRows.map((row) => (row.original as SevenxRecord)._id);

  const handleDelete = () =>
    confirm({
      message: t('confirm-delete-selected', { count: ids.length }),
      options: {
        confirmationValue: 'delete',
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(async () => {
      setLoading(true);
      const failures = await removeEach(ids, onRemove);
      setLoading(false);
      table.setRowSelection({});
      if (failures.length < ids.length) {
        toast.success(successMessage);
      }
      if (failures.length) {
        toast.error(failures[0]);
      }
    });

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('selected-count', { count: selectedRows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          className="text-destructive"
          disabled={loading}
          onClick={handleDelete}
        >
          <IconTrash />
          {t('delete')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
