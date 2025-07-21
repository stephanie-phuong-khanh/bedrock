'use client';

import PaymentsTab from '../payments/PaymentsTab';

interface PaidTabProps {
  key?: number;
}

export default function PaidTab({ key }: PaidTabProps) {
  // For now, we'll reuse the existing PaymentsTab component
  // This shows all completed payments, which represents "paid bills"
  return <PaymentsTab />;
}
