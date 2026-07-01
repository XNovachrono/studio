import type {NextConfig} from 'next';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'studio';
const basePath = process.env.BASE_PATH ?? (process.env.GITHUB_ACTIONS ? `/${repoName}` : '');
const assetPrefix = basePath ? `${basePath}/` : '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  basePath,
  assetPrefix,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
