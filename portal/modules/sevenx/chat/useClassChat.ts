'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { SEVENX_CHAT_MESSAGES, SEVENX_CHAT_MESSAGE_SEND } from '@/modules/sevenx/graphql';
import type { SevenxAttachmentInput, SevenxChatMessage } from '@/modules/sevenx/types';

type MessagesData = { sevenxChatMessages: SevenxChatMessage[] };
type SendData = { sevenxChatMessageSend: SevenxChatMessage };

/** Same limit everywhere so the entry card and the chat page share one cache entry. */
const CHAT_LIMIT = 100;
export const CHAT_MAX_LENGTH = 2000;
export const CHAT_MAX_ATTACHMENTS = 10;

/** Class group chat messages (oldest first), polled while mounted, plus a send action. */
export const useClassChat = (classId: string, pollInterval: number) => {
  const variables = { classId, limit: CHAT_LIMIT };
  const { data, loading, error, refetch } = useQuery<MessagesData>(SEVENX_CHAT_MESSAGES, {
    variables,
    fetchPolicy: 'cache-and-network',
    pollInterval,
  });

  const [sendMutation, { loading: sending }] = useMutation<SendData>(SEVENX_CHAT_MESSAGE_SEND, {
    update(cache, { data: result }) {
      const message = result?.sevenxChatMessageSend;
      if (!message) return;
      cache.updateQuery<MessagesData>({ query: SEVENX_CHAT_MESSAGES, variables }, (prev) => {
        const list = prev?.sevenxChatMessages ?? [];
        if (list.some((m) => m._id === message._id)) return prev;
        return { sevenxChatMessages: [...list, message].slice(-CHAT_LIMIT) };
      });
    },
  });

  const send = (body: string, attachments: SevenxAttachmentInput[] = []) =>
    sendMutation({ variables: { classId, body, attachments } });

  return {
    messages: data?.sevenxChatMessages ?? [],
    loading: loading && !data,
    error,
    refetch,
    send,
    sending,
  };
};
