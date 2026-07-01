export const getBasePath = () => {
  // En tiempo de compilación, process.env.NEXT_PUBLIC_BASE_PATH está disponible
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
};

export const withBasePath = (path: string): string => {
  const basePath = getBasePath();
  if (!path.startsWith('/')) {
    return path;
  }
  return `${basePath}${path}`;
};
