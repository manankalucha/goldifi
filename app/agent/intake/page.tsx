import { Suspense } from 'react';
import IntakeMobile from '@/components/agent/IntakeMobile';

export default function AgentIntakePage() {
  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', fontWeight: 600 }}>Mobile KYC Intake</h2>
      <Suspense fallback={<div className="spinner" />}>
        <IntakeMobile />
      </Suspense>
    </div>
  );
}
