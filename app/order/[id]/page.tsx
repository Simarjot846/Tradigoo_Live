'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, CheckCircle, Clock, Package, Truck, ShieldCheck, AlertTriangle, Upload, ChevronRight, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoRecorder } from '@/components/video-recorder';
import { toast } from 'sonner';

type OrderStatus = 'payment_in_escrow' | 'shipped' | 'courier_verified' | 'delivered' | 'inspection' | 'completed' | 'disputed';

import { createClient } from '@/lib/supabase-client';

export default function OrderTrackingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);

  // Helper to re-fetch order
  const fetchOrder = async () => {
    if (!params.id) return;
    const supabase = createClient();

    // Fetch order with product details
    const { data, error } = await supabase
      .from('orders')
      .select('*, product:products(name)')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      // fallback or redirect?
    } else {
      // Flatten structure slightly for easier usage if needed, or just use data.product.name
      setOrderData({
        ...data,
        product_name: data.product.name
      });
    }
    setLoadingOrder(false);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchOrder();
    // Real-time subscription could go here
    const supabase = createClient();
    const channel = supabase
      .channel('order_updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${params.id}`
      }, (payload: any) => {
        console.log("Real-time update:", payload);
        fetchOrder(); // simple re-fetch on change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.id, user, router]);

  if (loading || !user || loadingOrder || !orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-zinc-800 border-t-purple-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const statusSteps: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'payment_in_escrow', label: 'Payment Secured', icon: ShieldCheck },
    { status: 'shipped', label: 'Ready for Pickup', icon: Package },
    { status: 'courier_verified', label: 'Courier Verified', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle }, // Changed icon to distinguish
    { status: 'inspection', label: 'Inspection', icon: Clock },
    { status: 'completed', label: 'Completed', icon: CheckCircle }
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.status === orderData.status);
  const progress = ((currentStepIndex + 1) / statusSteps.length) * 100;

  const handleReadyForPickup = async () => {
    const supabase = createClient();
    // 1. Set status to 'shipped' (which we treat as Ready for Pickup logic)
    const { error } = await supabase
      .from('orders')
      .update({ status: 'shipped' })
      .eq('id', orderData.id);

    if (!error) {
      fetchOrder();
      toast.message("Courier Notified", {
        description: "Agent is arriving to verify weight & dimensions...",
        icon: <Truck className="w-4 h-4 text-purple-400" />
      });

      // Mock Courier Verification (5 seconds demo instead of 5 min)
      setTimeout(async () => {
        // Double check status hasn't changed manually
        const { data } = await supabase.from('orders').select('status').eq('id', orderData.id).single();
        if (data?.status === 'shipped') {
          await supabase
            .from('orders')
            .update({ status: 'courier_verified' })
            .eq('id', orderData.id);
          fetchOrder();
          toast.success("Courier Verified! Order picked up.");
        }
      }, 5000);
    }
  };

  const handleForceCourierVerify = async () => {
    // 1. Optimistic Update (Instant feedback)
    setOrderData((prev: any) => ({ ...prev, status: 'courier_verified' }));

    // 2. Actual DB Update
    const supabase = createClient();
    const { error } = await supabase
      .from('orders')
      .update({ status: 'courier_verified' })
      .eq('id', orderData.id);

    if (error) {
      // Revert on error
      console.error("Demo Verify Error:", error);
      toast.error("Demo action failed: " + error.message);
      fetchOrder(); // Re-fetch to true state
    } else {
      await fetchOrder();
      toast.success("Auto-verified by Judge (Demo Mode)");
    }
  };

  const handleSimulateDelivered = async () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const supabase = createClient();
    const { error } = await supabase
      .from('orders')
      .update({ status: 'delivered', otp: newOtp })
      .eq('id', orderData.id);

    if (!error) {
      await fetchOrder();
      setShowOtpDialog(true);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp === orderData.otp) {
      const supabase = createClient();
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'inspection',
          otp_verified: true,
          inspection_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', orderData.id);

      if (!error) {
        await fetchOrder();
        setShowOtpDialog(false);
        setOtp('');
        setOtpError('');
      }
    } else {
      setOtpError('Invalid OTP. Please try again.');
    }
  };

  const handleConfirmQuality = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderData.id);

    if (!error) fetchOrder();
  };

  const handleRaiseDispute = async () => {
    if (!videoBlob) {
      alert("Please record a video evidence first.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    let evidenceUrl = '';

    try {
      const formData = new FormData();
      formData.append('file', videoBlob, 'evidence.mp4');
      formData.append('orderId', orderData.id);

      const response = await fetch('/api/disputes/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      evidenceUrl = result.url;

      // 1. Create dispute record (mocked or real if table exists)
      // Ideally: await supabase.from('disputes').insert(...)

      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'disputed',
          dispute_reason: disputeReason,
          dispute_evidence: [evidenceUrl] // Storing array of URLs
        })
        .eq('id', orderData.id);

      if (orderError) throw orderError;

      await fetchOrder();
      setShowDisputeDialog(false);
      setVideoBlob(null);
      setDisputeReason('');
    } catch (error: any) {
      console.error("Dispute Error:", error);
      alert("Failed to raise dispute: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative overflow-hidden selection:bg-purple-500/30 transition-colors duration-300">
      {/* Global Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none text-left opacity-0 dark:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 bg-repeat mix-blend-overlay" />
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>



      <main className="container mx-auto px-6 py-10 relative z-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/5 pl-0 gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Order #{orderData.id.slice(0, 8).toUpperCase()}</h1>
                <Badge variant="outline" className="border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 font-mono">
                  {new Date(orderData.created_at).toLocaleDateString()}
                </Badge>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400">{orderData.product_name}</p>
            </div>
            <div className={`px-4 py-2 rounded-full border ${getStatusColor(orderData.status)} backdrop-blur-md`}>
              {getStatusLabel(orderData.status)}
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 backdrop-blur-xl mb-8 relative overflow-hidden shadow-sm dark:shadow-none"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

          <div className="mb-12 relative">
            <Progress value={progress} className="h-1 bg-zinc-200 dark:bg-zinc-800" indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500" />
          </div>

          <div className="grid grid-cols-5 gap-4 relative">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.status} className="flex flex-col items-center text-center relative">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + (index * 0.1) }}
                    className={`w-12 h-12 rounded-2xl mb-3 flex items-center justify-center transition-all duration-300 relative z-10 ${isCompleted
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600'
                      } ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <p className={`text-xs font-medium transition-colors duration-300 ${isCompleted ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-600'
                    }`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Status Action Cards */}
            <AnimatePresence mode="wait">
              {orderData.status === 'payment_in_escrow' && (
                <motion.div
                  key="escrow"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Payment Secured in Escrow</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 leading-relaxed">
                        Your payment of ₹{orderData.total_amount.toLocaleString()} is safely held.
                        {user.role === 'wholesaler'
                          ? "Please pack the order and mark as Ready for Pickup."
                          : "The supplier is preparing your order for shipment."}
                      </p>

                      {user.role === 'wholesaler' && (
                        <Button onClick={handleReadyForPickup} className="bg-blue-600 hover:bg-blue-500 text-white">
                          Ready for Pickup
                        </Button>
                      )}

                      {/* Retailer Demo Override */}
                      {user.role !== 'wholesaler' && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <p className="text-xs text-zinc-500 mb-2">Judge/Demo Mode Controls:</p>
                          <Button onClick={handleReadyForPickup} variant="outline" className="h-8 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10 w-full md:w-auto">
                            [Demo] Simulate Wholesaler Pickup
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {orderData.status === 'shipped' && (
                <motion.div
                  key="shipped"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-3xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm relative overflow-hidden"
                >
                  {/* Scanning Animation Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent w-full h-full"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />

                  <div className="flex items-start gap-4 relative z-10">
                    <div className="p-3 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Ready for Pickup</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 leading-relaxed">
                        Courier agent is verifying package weight & dimensions...
                      </p>

                      <div className="flex items-center gap-3 bg-black/20 p-3 rounded-lg border border-purple-500/20">
                        <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                        <span className="text-purple-300 text-sm font-medium">Scanning Package...</span>
                      </div>

                      {/* Demo Control to Skip Wait */}
                      {user.role !== 'wholesaler' && (
                        <div className="mt-4 flex justify-end">
                          <Button onClick={handleForceCourierVerify} size="sm" variant="secondary" className="bg-purple-500 hover:bg-purple-600 text-white border-0 text-xs">
                            [Demo] Instant Verify
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {orderData.status === 'courier_verified' && (
                <motion.div
                  key="courier_verified"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Courier Verified & In Transit</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 leading-relaxed">
                        Package verified by courier (Weight: {2 + Math.random()}kg). On route to destination.
                      </p>

                      <Button onClick={handleSimulateDelivered} variant="outline" className="border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-300">
                        [Demo] Simulate Delivery
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {orderData.status === 'inspection' && (
                <motion.div
                  key="inspection"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-3xl bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">24-Hour Inspection Window</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 leading-relaxed">
                        Inspect your goods carefully. Confirm quality to release payment, or report issues if there's a problem.
                      </p>
                      <div className="inline-block px-3 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono mb-4">
                        Deadline: {new Date(orderData.inspection_deadline).toLocaleString()}
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={handleConfirmQuality} className="bg-green-600 hover:bg-green-500 text-white border-0">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Quality
                        </Button>
                        <Button onClick={() => setShowDisputeDialog(true)} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Report Issue
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {orderData.status === 'completed' && (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-3xl bg-green-500/10 border border-green-500/20 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-green-500/20 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Order Completed Successfully!</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-2 leading-relaxed">
                        Payment of ₹{orderData.total_amount.toLocaleString()} has been released to the supplier.
                      </p>
                      <p className="text-sm text-green-400 font-medium">
                        Thank you for trading with Tradigoo! 🎉
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {orderData.status === 'disputed' && (
                <motion.div
                  key="disputed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Dispute Raised</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 leading-relaxed">
                        Your dispute has been registered. Our team will review the evidence and resolve within 48 hours.
                      </p>
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-4">
                        Reason: {orderData.dispute_reason}
                      </div>
                      <Button onClick={() => router.push(`/dispute/${orderData.id}`)} className="bg-red-600 hover:bg-red-500 text-white w-full">
                        View Dispute Status
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timeline/History Placeholder could go here */}
          </div>

          {/* Sidebar: Order Details */}
          <div className="lg:col-span-1">
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 backdrop-blur-xl sticky top-24 shadow-sm dark:shadow-none"
            >
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Order Details</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-white/5">
                  <span className="text-zinc-500 text-sm">Product</span>
                  <span className="text-zinc-900 dark:text-zinc-200 font-medium">{orderData.product_name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-white/5">
                  <span className="text-zinc-500 text-sm">Quantity</span>
                  <span className="text-zinc-900 dark:text-zinc-200 font-medium">{orderData.quantity} units</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-white/5">
                  <span className="text-zinc-500 text-sm">Total Amount</span>
                  <span className="text-zinc-900 dark:text-zinc-200 font-medium">₹{orderData.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-zinc-500 text-sm">Order Date</span>
                  <span className="text-zinc-900 dark:text-zinc-200 font-medium">{new Date(orderData.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                {orderData.status === 'completed' ? (
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-white/[0.02] border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"
                    onClick={() => window.open(`/order/${orderData.id}/invoice`, '_blank')}
                  >
                    Download Invoice
                    <Copy className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      disabled
                      className="w-full justify-between bg-white/[0.01] border-white/5 text-zinc-600 cursor-not-allowed opacity-50"
                    >
                      Invoice Unavailable
                      <Copy className="w-4 h-4" />
                    </Button>
                    <p className="text-xs text-zinc-500 text-center">
                      Invoice will be generated upon order completion.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* OTP Verification Dialog */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Verify Delivery</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Enter the OTP provided by the delivery person to confirm receipt
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center justify-between">
              <span className="text-sm text-blue-300">Demo OTP Code:</span>
              <code className="text-lg font-mono font-bold text-blue-400 tracking-wider">{orderData.otp}</code>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp" className="text-zinc-400">Enter 6-digit OTP</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="bg-zinc-950 border-zinc-800 text-center text-2xl tracking-[0.5em] h-14 font-mono focus:ring-blue-500/20"
              />
              {otpError && (
                <p className="text-sm text-red-400 mt-1 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" /> {otpError}
                </p>
              )}
            </div>

            <Button onClick={handleVerifyOtp} className="w-full bg-blue-600 hover:bg-blue-500">
              Verify & Start Inspection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Report Issue</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Describe the problem with your order. Upload evidence if available.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="dispute" className="text-zinc-400">Issue Description</Label>
              <Textarea
                id="dispute"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Describe the issue (e.g., damaged goods, wrong quantity, poor quality)"
                rows={4}
                className="bg-zinc-950 border-zinc-800 focus:ring-red-500/20 min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400">Video Evidence (Required)</Label>
              <div className="border border-zinc-800 rounded-xl bg-black/50 overflow-hidden">
                <VideoRecorder onRecordingComplete={(blob) => setVideoBlob(blob)} />
              </div>
              <p className="text-xs text-zinc-500">
                Please record a 30s video clearly showing the product issue.
              </p>
            </div>

            <Button
              onClick={handleRaiseDispute}
              className="w-full bg-red-600 hover:bg-red-500 text-white"
              disabled={!disputeReason.trim()}
            >
              Submit Dispute
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    'payment_in_escrow': 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    'shipped': 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    'courier_verified': 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
    'delivered': 'border-teal-500/30 bg-teal-500/10 text-teal-400',
    'inspection': 'border-orange-500/30 bg-orange-500/10 text-orange-400',
    'completed': 'border-green-500/30 bg-green-500/10 text-green-400',
    'disputed': 'border-red-500/30 bg-red-500/10 text-red-400'
  };
  return colors[status];
}

function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    'payment_in_escrow': 'Escrow Active',
    'shipped': 'Ready for Pickup',
    'courier_verified': 'In Transit',
    'delivered': 'Delivered',
    'inspection': 'Under Inspection',
    'completed': 'Order Completed',
    'disputed': 'Dispute Raised'
  };
  return labels[status];
}
