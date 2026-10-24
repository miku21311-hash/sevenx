import { ApolloCache, useMutation } from '@apollo/client';
import {
  SEVENX_INVITE_CREATE,
  SEVENX_INVITE_REMOVE,
  SEVENX_MEMBER_EDIT,
  SEVENX_MEMBER_REMOVE,
} from '../graphql/mutations';
import { ISevenxInvite, ISevenxMember, SevenxRole } from '~/modules/shared/types';

export type MemberEditableField = 'firstName' | 'lastName' | 'phone';

export interface InviteFormValues {
  email: string;
  firstName?: string;
  lastName?: string;
  classIds: string[];
}

const evictMemberLists = {
  update: (cache: ApolloCache<unknown>) => {
    cache.evict({ id: 'ROOT_QUERY', fieldName: 'sevenxMembers' });
    cache.evict({ id: 'ROOT_QUERY', fieldName: 'sevenxInvites' });
    cache.evict({ id: 'ROOT_QUERY', fieldName: 'sevenxDashboardStats' });
    cache.gc();
  },
};

export const useMemberMutations = () => {
  const [inviteCreateMutation, { loading: inviting }] = useMutation<{
    sevenxInviteCreate: ISevenxInvite;
  }>(SEVENX_INVITE_CREATE, evictMemberLists);

  const [inviteRemoveMutation, { loading: removingInvite }] = useMutation<{
    sevenxInviteRemove: string;
  }>(SEVENX_INVITE_REMOVE, evictMemberLists);

  const [memberRemoveMutation, { loading: removingMember }] = useMutation<{
    sevenxMemberRemove: string;
  }>(SEVENX_MEMBER_REMOVE, evictMemberLists);

  // The edit returns the member with its _id, so Apollo updates every cached list in place.
  const [memberEditMutation, { loading: editingMember }] = useMutation<{
    sevenxMemberEdit: ISevenxMember;
  }>(SEVENX_MEMBER_EDIT);

  return {
    createInvite: (role: SevenxRole, values: InviteFormValues) =>
      inviteCreateMutation({ variables: { role, ...values } }),
    removeInvite: (_id: string) => inviteRemoveMutation({ variables: { _id } }),
    removeMember: (_id: string) => memberRemoveMutation({ variables: { _id } }),
    editMember: (_id: string, field: MemberEditableField, value: string) =>
      memberEditMutation({ variables: { _id, [field]: value } }),
    editing: editingMember,
    loading: inviting || removingInvite || removingMember,
  };
};
