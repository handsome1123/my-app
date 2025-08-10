// app/verify/page.tsx
import { Suspense } from 'react';
import VerifyForm from './verify-form';

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
