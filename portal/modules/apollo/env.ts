/** In the browser this is the same-origin proxy defined in next.config.ts,
 * on the server the gateway itself. */
export const API_URL: string =
  typeof window === 'undefined'
    ? process.env.ERXES_API_URL || 'http://localhost:4000'
    : process.env.NEXT_PUBLIC_ERXES_API_URL || '/erxes-api';

export const CP_TOKEN: string = process.env.NEXT_PUBLIC_ERXES_CP_TOKEN || '';

export const CLIENT_PORTAL_ID: string =
  process.env.NEXT_PUBLIC_CLIENT_PORTAL_ID || '';

export const GRAPHQL_URL = `${API_URL}/graphql`;

export const UPLOAD_URL = `${API_URL}/upload-file`;
