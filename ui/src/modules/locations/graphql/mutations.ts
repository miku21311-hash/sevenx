import { gql } from '@apollo/client';
import { SEVENX_LOCATION_FIELDS } from './queries';

export const SEVENX_LOCATION_ADD = gql`
  mutation sevenxLocationAddMutation(
    $name: String!
    $address: String
    $rooms: [String!]
    $latitude: Float
    $longitude: Float
    $checkInRadius: Int
  ) {
    sevenxLocationAdd(
      name: $name
      address: $address
      rooms: $rooms
      latitude: $latitude
      longitude: $longitude
      checkInRadius: $checkInRadius
    ) {
      ${SEVENX_LOCATION_FIELDS}
    }
  }
`;

export const SEVENX_LOCATION_EDIT = gql`
  mutation sevenxLocationEditMutation(
    $_id: String!
    $name: String!
    $address: String
    $rooms: [String!]
    $latitude: Float
    $longitude: Float
    $checkInRadius: Int
  ) {
    sevenxLocationEdit(
      _id: $_id
      name: $name
      address: $address
      rooms: $rooms
      latitude: $latitude
      longitude: $longitude
      checkInRadius: $checkInRadius
    ) {
      ${SEVENX_LOCATION_FIELDS}
    }
  }
`;

export const SEVENX_LOCATION_REMOVE = gql`
  mutation sevenxLocationRemoveMutation($_id: String!) {
    sevenxLocationRemove(_id: $_id)
  }
`;
