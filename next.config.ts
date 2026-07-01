import type {NextConfig} from 'next';

// Usar BASE_PATH del workflow de GitHub Actions, o detectar si se compiló explícitamente para GitHub Pages
const basePath = process.env.BASE_PATH || (process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true' ? '/studio' : '');
const assetPrefix = basePath ? `${basePath}/` : '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  basePath,
  assetPrefix,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
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
