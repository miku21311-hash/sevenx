import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Sheet, StringArrayInput } from 'erxes-ui';
import { IconCurrentLocation } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ISevenxLocation } from '~/modules/shared/types';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';
import {
  LocationFormValues,
  useLocationMutations,
} from '../hooks/useLocationMutations';

interface LocationFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: ISevenxLocation | null;
}

const toValues = (location?: ISevenxLocation | null): LocationFormValues => ({
  name: location?.name ?? '',
  address: location?.address ?? '',
  rooms: location?.rooms ?? [],
  latitude: location?.latitude?.toString() ?? '',
  longitude: location?.longitude?.toString() ?? '',
  checkInRadius: String(location?.checkInRadius ?? 150),
});

const inRange = (value: string, min: number, max: number) => {
  if (value.trim() === '') return true;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
};

export const LocationFormSheet = ({
  open,
  onOpenChange,
  location,
}: LocationFormSheetProps) => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const { addLocation, editLocation, loading } = useLocationMutations();
  const [locating, setLocating] = useState(false);

  const schema = z
    .object({
      name: z.string().trim().min(1, t('field-required')),
      address: z.string().optional(),
      rooms: z.array(z.string()),
      latitude: z.string().refine((v) => inRange(v, -90, 90), t('latitude-range')),
      longitude: z.string().refine((v) => inRange(v, -180, 180), t('longitude-range')),
      checkInRadius: z
        .string()
        .refine((v) => v.trim() !== '' && inRange(v, 20, 2000), t('radius-range')),
    })
    .refine((v) => (v.latitude.trim() === '') === (v.longitude.trim() === ''), {
      message: t('coordinates-together'),
      path: ['longitude'],
    });

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toValues(location),
  });

  useEffect(() => {
    if (open) {
      form.reset(toValues(location));
    }
  }, [open, location, form]);

  const useCurrentPosition = () => {
    if (!navigator.geolocation) {
      toast.error(t('location-unavailable'));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        form.setValue('latitude', coords.latitude.toFixed(6), { shouldValidate: true });
        form.setValue('longitude', coords.longitude.toFixed(6), { shouldValidate: true });
        setLocating(false);
      },
      () => {
        toast.error(t('location-unavailable'));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const onSubmit = async (values: LocationFormValues) => {
    try {
      if (location) {
        await editLocation(location._id, values);
      } else {
        await addLocation(values);
      }
      toast.success(t('location-saved'));
      onOpenChange(false);
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="sm:max-w-lg w-full p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            <Sheet.Header className="p-5">
              <Sheet.Title>
                {location ? t('edit-location') : t('add-location')}
              </Sheet.Title>
              <Sheet.Description className="sr-only">
                {t('locations')}
              </Sheet.Description>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="px-5 py-4 flex flex-col gap-4 flex-1 overflow-y-auto overflow-x-hidden">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('name')}</Form.Label>
                    <Form.Control>
                      <Input {...field} autoFocus />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="address"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('address')}{' '}
                      <span className="text-muted-foreground">
                        ({t('optional')})
                      </span>
                    </Form.Label>
                    <Form.Control>
                      <Input {...field} value={field.value ?? ''} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="rooms"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('rooms')}</Form.Label>
                    <Form.Control>
                      <StringArrayInput
                        id="sevenx-location-rooms"
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('rooms-placeholder')}
                        styleClasses={{
                          inlineTagsContainer: 'border border-input',
                        }}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <fieldset className="flex flex-col gap-3 rounded-lg border p-4">
                <legend className="px-1 text-sm font-medium">{t('check-in-point')}</legend>
                <p className="text-xs text-muted-foreground">{t('check-in-point-hint')}</p>
                <div className="grid grid-cols-2 gap-3">
                  <Form.Field
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('latitude')}</Form.Label>
                        <Form.Control>
                          <Input {...field} inputMode="decimal" placeholder="47.918500" />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('longitude')}</Form.Label>
                        <Form.Control>
                          <Input {...field} inputMode="decimal" placeholder="106.917700" />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 items-end gap-3">
                  <Form.Field
                    control={form.control}
                    name="checkInRadius"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('check-in-radius')}</Form.Label>
                        <Form.Control>
                          <Input {...field} inputMode="numeric" />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={useCurrentPosition}
                    disabled={locating}
                  >
                    <IconCurrentLocation />
                    {locating ? t('locating') : t('use-my-location')}
                  </Button>
                </div>
              </fieldset>
            </Sheet.Content>
            <Sheet.Footer className="flex justify-end gap-2 px-5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('saving') : t('save')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
