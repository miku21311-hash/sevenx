import { IconMapPin, IconPlus } from '@tabler/icons-react';
import { Button, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LocationFormSheet } from '~/modules/locations/components/LocationFormSheet';
import { LocationsTable } from '~/modules/locations/components/LocationsTable';
import { useLocationMutations } from '~/modules/locations/hooks/useLocationMutations';
import { useLocations } from '~/modules/locations/hooks/useLocations';
import { QueryError, SevenxPageHeader } from '~/modules/shared/components';
import { ISevenxLocation } from '~/modules/shared/types';

export const LocationsPage = () => {
  const { t } = useTranslation('sevenx');
  const { locations, loading, error, refetch } = useLocations();
  const { removeLocation } = useLocationMutations();
  const [createOpen, setCreateOpen] = useState(false);
  // The edited location lives in the URL so it can be deep-linked.
  const [locationId, setLocationId] = useQueryState<string>('locationId');
  const editing = locations.find((l) => l._id === locationId) ?? null;

  const openCreate = () => {
    setLocationId(null);
    setCreateOpen(true);
  };

  const openEdit = (location: ISevenxLocation) => {
    setCreateOpen(false);
    setLocationId(location._id);
  };

  const onFormOpenChange = (open: boolean) => {
    if (open) return;
    setCreateOpen(false);
    setLocationId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <SevenxPageHeader
        icon={IconMapPin}
        iconName="IconMapPin"
        title={t('locations')}
        path="/sevenx/locations"
      >
        <Button onClick={openCreate} aria-label={t('add-location')}>
          <IconPlus />
          <span className="hidden sm:inline">{t('add-location')}</span>
        </Button>
      </SevenxPageHeader>
      <div className="flex-1 overflow-hidden flex flex-col">
        {error ? (
          <QueryError message={error.message} onRetry={() => refetch()} />
        ) : (
          <LocationsTable
            locations={locations}
            loading={loading}
            onEdit={openEdit}
            onRemove={removeLocation}
            onAdd={openCreate}
            t={t}
          />
        )}
      </div>
      <LocationFormSheet
        open={createOpen || !!editing}
        onOpenChange={onFormOpenChange}
        location={editing}
      />
    </div>
  );
};
