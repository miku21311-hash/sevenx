'use client';

import type { CSSProperties } from 'react';
import Picker, { Categories, EmojiStyle, SkinTonePickerLocation, SuggestionMode, Theme } from 'emoji-picker-react';
import { useT } from '@/modules/i18n/I18nProvider';

export const EMOJI_PICKER_HEIGHT = 380;

const CATEGORY_KEYS: [Categories, string][] = [
  [Categories.SUGGESTED, 'chat.emojiCat.recent'],
  [Categories.SMILEYS_PEOPLE, 'chat.emojiCat.smileys'],
  [Categories.ANIMALS_NATURE, 'chat.emojiCat.animals'],
  [Categories.FOOD_DRINK, 'chat.emojiCat.food'],
  [Categories.TRAVEL_PLACES, 'chat.emojiCat.travel'],
  [Categories.ACTIVITIES, 'chat.emojiCat.activities'],
  [Categories.OBJECTS, 'chat.emojiCat.objects'],
  [Categories.SYMBOLS, 'chat.emojiCat.symbols'],
  [Categories.FLAGS, 'chat.emojiCat.flags'],
];

// Map the library's palette onto the portal's design tokens.
const THEME_VARS = {
  '--epr-bg-color': 'var(--background)',
  '--epr-category-label-bg-color': 'color-mix(in oklch, var(--background) 92%, transparent)',
  '--epr-text-color': 'var(--foreground)',
  '--epr-hover-bg-color': 'var(--accent)',
  '--epr-focus-bg-color': 'var(--accent)',
  '--epr-highlight-color': 'var(--primary)',
  '--epr-category-icon-active-color': 'var(--primary)',
  '--epr-search-input-bg-color': 'var(--accent)',
  '--epr-search-input-bg-color-active': 'var(--background)',
  '--epr-search-border-color-active': 'var(--primary)',
  '--epr-picker-border-color': 'var(--border)',
  '--epr-picker-border-radius': '16px',
  '--epr-emoji-size': '28px',
  // Compact header: slim search, small category icons, tight spacing.
  '--epr-horizontal-padding': '10px',
  '--epr-header-padding': '8px var(--epr-horizontal-padding) 4px',
  '--epr-search-input-height': '32px',
  '--epr-search-input-border-radius': '999px',
  '--epr-skin-tone-size': '12px',
  '--epr-category-navigation-button-size': '20px',
  '--epr-category-icon-inactive-color': 'var(--accent-foreground)',
  '--epr-category-label-height': '28px',
} as CSSProperties;

export function EmojiPickerPanel({ onPick }: { onPick: (emoji: string) => void }) {
  const t = useT();
  return (
    <Picker
      onEmojiClick={(data) => onPick(data.emoji)}
      emojiStyle={EmojiStyle.NATIVE}
      theme={Theme.LIGHT}
      suggestedEmojisMode={SuggestionMode.RECENT}
      skinTonePickerLocation={SkinTonePickerLocation.SEARCH}
      categories={CATEGORY_KEYS.map(([category, key]) => ({ category, name: t(key) }))}
      searchPlaceholder=""
      searchClearButtonLabel={t('chat.emojiClear')}
      previewConfig={{ showPreview: false }}
      autoFocusSearch={false}
      lazyLoadEmojis
      width="100%"
      height={EMOJI_PICKER_HEIGHT}
      style={THEME_VARS}
      // The library title-cases labels, which reads wrong in Mongolian.
      className="[&_.epr-emoji-category-label]:normal-case! [&_.epr-emoji-category-label]:text-xs! [&_.epr-emoji-category-label]:font-medium! [&_.epr-emoji-category-label]:text-muted!"
    />
  );
}
