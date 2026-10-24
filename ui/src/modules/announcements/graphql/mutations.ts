import { gql } from '@apollo/client';
import { SEVENX_ANNOUNCEMENT_FIELDS } from './queries';

export const SEVENX_ANNOUNCEMENT_ADD = gql`
  mutation sevenxAnnouncementAddMutation(
    $scope: SevenxAnnouncementScope!
    $classId: String
    $title: String!
    $body: String!
    $attachments: [SevenxAttachmentInput!]
  ) {
    sevenxAnnouncementAdd(
      scope: $scope
      classId: $classId
      title: $title
      body: $body
      attachments: $attachments
    ) {
      ${SEVENX_ANNOUNCEMENT_FIELDS}
    }
  }
`;

export const SEVENX_ANNOUNCEMENT_REMOVE = gql`
  mutation sevenxAnnouncementRemoveMutation($_id: String!) {
    sevenxAnnouncementRemove(_id: $_id)
  }
`;
