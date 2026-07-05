import { useMemo } from 'react';

export function useToolInitializer(
  initialValues: Record<string, number> | undefined,
): Record<string, string> {
  return useMemo(() => {
    if (!initialValues) return {};
    return Object.fromEntries(
      Object.entries(initialValues).map(([k, v]) => [k, String(v)])
    );
  }, [initialValues]);
}
