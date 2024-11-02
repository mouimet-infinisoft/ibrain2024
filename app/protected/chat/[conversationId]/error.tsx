'use client';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <Alert variant="destructive" className="m-4">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error.message}
      </AlertDescription>
    </Alert>
  );
}
