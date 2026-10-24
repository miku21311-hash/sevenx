import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const apiUrl = (
  process.env.ERXES_API_URL || 'http://localhost:4000'
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  env: {
    // Server-side rendering talks to the gateway directly.
    ERXES_API_URL: apiUrl,
    // Optional override for the browser; left empty it uses the proxy below.
    NEXT_PUBLIC_ERXES_API_URL: (
      process.env.NEXT_PUBLIC_ERXES_API_URL || ''
    ).replace(/\/$/, ''),
  },
  // The browser reaches the gateway through the portal's own origin, so the
  // portal works behind a tunnel or reverse proxy with only its port exposed
  // and without CORS or third-party cookie issues.
  async rewrites() {
    return [{ source: '/erxes-api/:path*', destination: `${apiUrl}/:path*` }];
  },
  // The app has its own lockfile inside the erxes monorepo; pin the root so
  // Turbopack does not pick the repository root.
  turbopack: {
    root: fileURLToPath(new URL('.', import.meta.url)),
  },
};

export default nextConfig;
