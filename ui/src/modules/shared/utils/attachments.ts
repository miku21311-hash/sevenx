import { REACT_APP_API_URL, readImage } from 'erxes-ui';
import { ISevenxAttachment } from '~/modules/shared/types';

/** `type` stored on attachments that are plain web links, not uploads. */
export const LINK_ATTACHMENT_TYPE = 'link';

const IMAGE_EXTENSION = /\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?.*)?$/i;

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);

export const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isLinkAttachment = (attachment: ISevenxAttachment): boolean =>
  attachment.type === LINK_ATTACHMENT_TYPE;

export const isImageAttachment = (attachment: ISevenxAttachment): boolean =>
  !isLinkAttachment(attachment) &&
  (attachment.type?.startsWith('image/') || IMAGE_EXTENSION.test(attachment.url));

/** Resolves a stored upload key or URL into an address the browser can open. */
export const attachmentHref = (attachment: ISevenxAttachment): string =>
  isAbsoluteUrl(attachment.url)
    ? attachment.url
    : `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(attachment.url)}`;

export const attachmentPreviewSrc = (attachment: ISevenxAttachment): string =>
  isAbsoluteUrl(attachment.url) ? attachment.url : readImage(attachment.url, 400);

export const readableSize = (bytes?: number | null): string => {
  if (!bytes) return '';
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};
