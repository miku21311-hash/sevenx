import { IconFile, IconLink, IconX } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ISevenxAttachment } from '~/modules/shared/types';
import {
  attachmentHref,
  attachmentPreviewSrc,
  isImageAttachment,
  isLinkAttachment,
  readableSize,
} from '~/modules/shared/utils/attachments';

interface AttachmentListProps {
  attachments: ISevenxAttachment[];
  /** When set, each attachment gets a remove button. */
  onRemove?: (index: number) => void;
}

export const AttachmentList = ({ attachments, onRemove }: AttachmentListProps) => {
  const { t } = useTranslation('sevenx');

  if (attachments.length === 0) {
    return null;
  }

  const images = attachments
    .map((attachment, index) => ({ attachment, index }))
    .filter(({ attachment }) => isImageAttachment(attachment));
  const others = attachments
    .map((attachment, index) => ({ attachment, index }))
    .filter(({ attachment }) => !isImageAttachment(attachment));

  const removeButton = (index: number, className: string) =>
    onRemove && (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={className}
        aria-label={t('remove-attachment')}
        onClick={() => onRemove(index)}
      >
        <IconX />
      </Button>
    );

  return (
    <div className="flex flex-col gap-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map(({ attachment, index }) => (
            <div
              key={`${attachment.url}-${index}`}
              className="relative size-24 overflow-hidden rounded-md border bg-muted"
            >
              <a
                href={attachmentHref(attachment)}
                target="_blank"
                rel="noreferrer"
                title={attachment.name}
              >
                <img
                  src={attachmentPreviewSrc(attachment)}
                  alt={attachment.name}
                  className="size-full object-cover"
                />
              </a>
              {removeButton(index, 'absolute right-1 top-1 size-6 bg-background/80')}
            </div>
          ))}
        </div>
      )}
      {others.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {others.map(({ attachment, index }) => {
            const Icon = isLinkAttachment(attachment) ? IconLink : IconFile;
            return (
              <li
                key={`${attachment.url}-${index}`}
                className="flex max-w-full items-center gap-2 rounded-md border px-2 py-1 text-xs"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <a
                  href={attachmentHref(attachment)}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-primary hover:underline"
                  title={attachment.url}
                >
                  {attachment.name}
                </a>
                {attachment.size ? (
                  <span className="shrink-0 text-muted-foreground">
                    {readableSize(attachment.size)}
                  </span>
                ) : null}
                {removeButton(index, 'size-5 shrink-0')}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
