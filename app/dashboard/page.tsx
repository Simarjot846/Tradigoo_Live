"use client";

import { useAuth } from "@/lib/auth-context";
import { BuyerDashboard } from "@/components/dashboard/buyer-dashboard";
import { SellerDashboard } from "@/components/dashboard/seller-dashboard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) return null; // Middleware will handle redirect

  // Strict Role-Based Rendering
  if (user.role === 'wholesaler') {
    return <SellerDashboard />;
  }

  // Default to Buyer Dashboard for retailers or undefined roles
  return <BuyerDashboard />;
}
