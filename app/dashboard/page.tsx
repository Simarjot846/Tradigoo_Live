'use client';

import { useAuth } from '@/lib/auth-context';
import { BuyerDashboard } from '@/components/dashboard/buyer-dashboard';
import { SellerDashboard } from '@/components/dashboard/seller-dashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  // Show seller dashboard for wholesalers, buyer dashboard for retailers
  if (user?.role === 'wholesaler') {
    return <SellerDashboard />;
  }

  return <BuyerDashboard />;
}
