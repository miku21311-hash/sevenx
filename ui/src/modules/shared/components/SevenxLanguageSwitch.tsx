import { IconLanguage } from '@tabler/icons-react';
import { Sidebar, ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'mn', label: 'MN' },
];

/**
 * Switches the host i18next language. Rendered in the `AppLayout` footer, so
 * it stays pinned to the bottom of the sidebar. The host persists the choice.
 */
export const SevenxLanguageSwitch = () => {
  const { t, i18n } = useTranslation('sevenx');
  const current = i18n.resolvedLanguage ?? i18n.language;

  return (
    <Sidebar.MenuItem className="flex items-center justify-between gap-2 px-2 py-1">
      <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <IconLanguage className="size-4 shrink-0" />
        <span className="truncate">{t('language')}</span>
      </span>
      <ToggleGroup
        type="single"
        variant="outline"
        value={current}
        onValueChange={(value) => value && i18n.changeLanguage(value)}
      >
        {LANGUAGES.map((language) => (
          <ToggleGroup.Item
            key={language.code}
            value={language.code}
            aria-label={language.label}
            className="h-8 min-w-9 px-2 text-xs"
          >
            {language.label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
    </Sidebar.MenuItem>
  );
};
