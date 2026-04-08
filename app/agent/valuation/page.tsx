import { Suspense } from 'react';
import ValuationMobile from '@/components/agent/ValuationMobile';

export default function AgentValuationPage() {
  return (
    <Suspense fallback={<div className="spinner" />}>
      <ValuationMobile />
    </Suspense>
  );
}
