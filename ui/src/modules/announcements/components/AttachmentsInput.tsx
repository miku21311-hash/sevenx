import { IconLink, IconPaperclip } from '@tabler/icons-react';
import { Button, Input, useUpload } from 'erxes-ui';
import { ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AttachmentList } from '~/modules/shared/components';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';
import { ISevenxAttachment } from '~/modules/shared/types';
import { isHttpUrl, LINK_ATTACHMENT_TYPE } from '~/modules/shared/utils/attachments';

interface AttachmentsInputProps {
  value: ISevenxAttachment[];
  onChange: (value: ISevenxAttachment[]) => void;
  disabled?: boolean;
}

export const AttachmentsInput = ({ value, onChange, disabled }: AttachmentsInputProps) => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const { upload, isLoading } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  // `upload` reports files one by one; keep the latest list between callbacks.
  const valueRef = useRef(value);
  valueRef.current = value;

  const append = (attachment: ISevenxAttachment) => {
    valueRef.current = [...valueRef.current, attachment];
    onChange(valueRef.current);
  };

  const onFilesPicked = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

    upload({
      files,
      afterUpload: ({ status, response, fileInfo }) => {
        const key = typeof response === 'string' ? response.trim() : '';
        if (status !== 'ok' || !key) {
          toast.error(t('upload-failed'));
          return;
        }
        append({ url: key, name: fileInfo.name, size: fileInfo.size, type: fileInfo.type });
      },
    });

    event.target.value = '';
  };

  const addLink = () => {
    const url = linkUrl.trim();
    if (!isHttpUrl(url)) {
      setLinkError(t('invalid-url'));
      return;
    }
    append({ url, name: linkTitle.trim() || url, type: LINK_ATTACHMENT_TYPE });
    setLinkUrl('');
    setLinkTitle('');
    setLinkError(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <AttachmentList
        attachments={value}
        onRemove={(index) => onChange(value.filter((_, i) => i !== index))}
      />
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={onFilesPicked}
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isLoading}
          onClick={() => fileInputRef.current?.click()}
        >
          <IconPaperclip />
          {isLoading ? t('uploading') : t('attach-file')}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            value={linkUrl}
            placeholder={t('link-url')}
            disabled={disabled}
            onChange={(e) => {
              setLinkUrl(e.target.value);
              setLinkError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLink();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || !linkUrl.trim()}
            onClick={addLink}
          >
            <IconLink />
            {t('add-link')}
          </Button>
        </div>
        <Input
          value={linkTitle}
          placeholder={t('link-title')}
          disabled={disabled}
          onChange={(e) => setLinkTitle(e.target.value)}
        />
        {linkError && <p className="text-sm text-destructive">{linkError}</p>}
      </div>
    </div>
  );
};
