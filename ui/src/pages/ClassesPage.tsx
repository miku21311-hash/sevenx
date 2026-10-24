import { IconBook2, IconPlus } from '@tabler/icons-react';
import { Button, useMultiQueryState } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { ClassesFilter } from '~/modules/classes/components/ClassesFilter';
import { ClassesTable } from '~/modules/classes/components/ClassesTable';
import { ClassFormSheet } from '~/modules/classes/components/ClassFormSheet';
import { useClasses } from '~/modules/classes/hooks/useClasses';
import { useClassMutations } from '~/modules/classes/hooks/useClassMutations';
import { QueryError, SevenxPageHeader } from '~/modules/shared/components';
import { ISevenxClass } from '~/modules/shared/types';

export const ClassesPage = () => {
  const { t } = useTranslation('sevenx');
  const [{ locationId, teacherId }, setQuery] = useMultiQueryState<{
    locationId: string;
    teacherId: string;
  }>(['locationId', 'teacherId']);
  const [search, setSearch] = useState('');
  const [searchValue] = useDebounce(search, 300);

  const { classes, loading, error, refetch } = useClasses({
    locationId: locationId ?? undefined,
    teacherId: teacherId ?? undefined,
    searchValue: searchValue || undefined,
  });
  const { removeClass } = useClassMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ISevenxClass | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (classItem: ISevenxClass) => {
    setEditing(classItem);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <SevenxPageHeader icon={IconBook2} iconName="IconBook2" title={t('classes')} path="/sevenx/classes">
        <Button onClick={openCreate} aria-label={t('add-class')}>
          <IconPlus />
          <span className="hidden sm:inline">{t('add-class')}</span>
        </Button>
      </SevenxPageHeader>
      <ClassesFilter
        locationId={locationId ?? undefined}
        teacherId={teacherId ?? undefined}
        search={search}
        onLocationChange={(value) => setQuery({ locationId: value ?? null })}
        onTeacherChange={(value) => setQuery({ teacherId: value ?? null })}
        onSearchChange={setSearch}
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        {error ? (
          <QueryError message={error.message} onRetry={() => refetch()} />
        ) : (
          <ClassesTable
            classes={classes}
            loading={loading}
            onEdit={openEdit}
            onRemove={removeClass}
            onAdd={openCreate}
            t={t}
          />
        )}
      </div>
      <ClassFormSheet open={formOpen} onOpenChange={setFormOpen} classItem={editing} />
    </div>
  );
};
