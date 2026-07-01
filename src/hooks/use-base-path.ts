export function useBasePath(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (!path.startsWith('/')) {
    return path;
  }
  return `${basePath}${path}`;
}
