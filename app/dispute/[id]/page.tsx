'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ShieldAlert, CheckCircle, Scale, MapPin, Package, Camera, User, FileText, ArrowLeft, Bot, Truck } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { checkFraudRisk, FraudCheckResult } from '@/lib/fraud-detection';
import { toast } from 'sonner';

export default function DisputeResolutionPage() {
    const { user, loading, refreshUser } = useAuth(); // Add refreshUser
    const router = useRouter();
    const params = useParams();
    const [orderData, setOrderData] = useState<any>(null);
    const [fraudAnalysis, setFraudAnalysis] = useState<FraudCheckResult | null>(null);
    const [analyzing, setAnalyzing] = useState(true);

    useEffect(() => {
        if (!loading && !user) router.push('/auth/login');
        if (user && params.id) loadDisputeData();
    }, [user, loading, params.id]);

    const loadDisputeData = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('orders')
            .select('*, product:products(name)')
            .eq('id', params.id)
            .single();

        if (data) {
            setOrderData(data);
            // Run AI Analysis
            const result = await checkFraudRisk(data.id, user?.id || '', user?.role || 'retailer');
            setFraudAnalysis(result);
            setAnalyzing(false);
        }
    };

    const handleConfirmResolution = async () => {
        const supabase = createClient();

        // 1. Resolve Dispute
        const { error: matchError } = await supabase
            .from('orders')
            .update({ status: 'completed', dispute_reason: null })
            .eq('id', params.id);

        // 2. Penalty
        // Deduct 50 trust score for current user to show effect in demo
        let newPenaltyScore = 0;
        if (user) {
            newPenaltyScore = Math.max((user.trust_score || 95) - 50, 0);
            await supabase
                .from('profiles')
                .update({ trust_score: newPenaltyScore })
                .eq('id', user.id);
        }

        // Also deduct for the other party
        const otherPartyId = user?.id === orderData.buyer_id ? orderData.seller_id : orderData.buyer_id;
        if (otherPartyId) {
            const { data: otherProfile } = await supabase.from('profiles').select('trust_score').eq('id', otherPartyId).single();
            if (otherProfile) {
                const newOtherScore = Math.max((otherProfile.trust_score || 95) - 50, 0);
                await supabase.from('profiles').update({ trust_score: newOtherScore }).eq('id', otherPartyId);
            }
        }

        if (matchError) {
            console.error("Resolution Error:", matchError);
            if (user) user.trust_score = newPenaltyScore;
            toast.info(`Demo Mode: Resolution confirmed locally (Trust Score decreased by 50)`);
            router.push('/dashboard');
        } else {
            // Success path
            await refreshUser(); // Fetch the new score from DB
            toast.success("Dispute Resolved. Fraud penalty applied: Trust Score decreased by -50.");
            router.push('/dashboard');
        }
    };

    const handleManualReview = () => {
        toast.message("Request Sent", {
            description: "A Tradigoo agent will review this case within 24 hours.",
            icon: <Bot className="w-4 h-4 text-blue-400" />
        });
    };

    if (loading || !orderData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-zinc-800 border-t-red-500 rounded-full animate-spin" />
                    <p className="text-zinc-500 animate-pulse">Loading Dispute Details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/order/${params.id}`)}
                            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white pl-0 gap-2 mb-2 hover:bg-zinc-200 dark:hover:bg-white/5"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Order
                        </Button>
                        <h1 className="text-3xl font-bold flex items-center gap-3 text-zinc-900 dark:text-white">
                            <Scale className="w-8 h-8 text-red-500" />
                            Dispute Resolution Center
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 ml-1">Case #{params.id?.slice(0, 8)} • Order: {orderData.product.name}</p>
                    </div>

                    {fraudAnalysis?.riskLevel === 'HIGH' && (
                        <div className="px-6 py-3 rounded-full bg-red-500/10 border border-red-500/50 flex items-center gap-3 animate-pulse">
                            <ShieldAlert className="w-6 h-6 text-red-500" />
                            <div>
                                <div className="font-bold text-red-400">High Risk Detected</div>
                                <div className="text-xs text-red-300">Escalated to 48h Inspection</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Analysis Banner */}
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-none">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500" />
                    <CardHeader className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-100 dark:border-white/5 pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg text-zinc-900 dark:text-white">
                            <Bot className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                            AI Case Assessment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {analyzing ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                <p className="text-zinc-500 text-sm animate-pulse">Analyzing Case Details...</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                    <div className="text-sm text-zinc-500 uppercase font-bold">Risk Score</div>
                                    <div className={`text-3xl font-bold ${fraudAnalysis?.riskLevel === 'HIGH' ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {(fraudAnalysis?.riskScore || 0) * 100}%
                                    </div>
                                    <Badge variant="outline" className={fraudAnalysis?.riskLevel === 'HIGH' ? 'border-red-500 text-red-400' : 'border-emerald-500 text-emerald-400'}>
                                        {fraudAnalysis?.riskLevel} Risk
                                    </Badge>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <div className="text-sm text-zinc-500 uppercase font-bold">Analysis Flags</div>
                                    <div className="flex flex-wrap gap-2">
                                        {fraudAnalysis?.flags.length === 0 ? (
                                            <span className="text-zinc-500 italic">No verification issues found.</span>
                                        ) : (
                                            fraudAnalysis?.flags.map((flag, i) => (
                                                <Badge key={i} variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-300">
                                                    {flag}
                                                </Badge>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm text-zinc-500 uppercase font-bold">Recommendation</div>
                                    <div className="text-sm font-medium text-zinc-900 dark:text-white">
                                        {fraudAnalysis?.recommendation}
                                    </div>
                                </div>
                            </div>
                        )}

                        <Separator className="my-6 bg-zinc-100 dark:bg-white/5" />

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <div className="flex-1">
                                <div className="text-blue-700 dark:text-blue-200 font-medium mb-1">AI Conclusion</div>
                                <div className="text-blue-900 dark:text-blue-100 text-lg">
                                    "Probable Cause: <span className="font-bold">Courier Mishandling (75% Confidence)</span>. Box damage consistent with transit impact."
                                </div>
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-500 whitespace-nowrap">
                                Accept Assessment
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tri-Party Evidence Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Retailer Column */}
                    <EvidenceColumn
                        title="Retailer (Buyer)"
                        role="Claimant"
                        icon={User}
                        color="blue"
                        data={{
                            message: orderData.dispute_reason,
                            evidence: orderData.dispute_evidence,
                            timestamp: "2 hours ago"
                        }}
                    />

                    {/* Courier Column */}
                    <EvidenceColumn
                        title="Courier Partner"
                        role="Logistics"
                        icon={Truck}
                        color="orange"
                        data={{
                            message: "Delivered safely. GPS matched location. Weight verified at 2.4kg.",
                            evidence: ["https://placehold.co/600x400/png?text=Package+Photo", "https://placehold.co/600x400/png?text=GPS+Map"], // Mock
                            timestamp: "5 hours ago",
                            verified: true
                        }}
                    />

                    {/* Wholesaler Column */}
                    <EvidenceColumn
                        title="Wholesaler"
                        role="Supplier"
                        icon={Package}
                        color="purple"
                        data={{
                            message: "Packed under CCTV. QC Passed.",
                            evidence: ["https://placehold.co/600x400/png?text=Packing+CCTV"], // Mock
                            timestamp: "2 days ago",
                            verified: true
                        }}
                    />
                </div>

                {/* Resolution Matrix */}
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-none">
                    <CardHeader>
                        <CardTitle className="text-zinc-900 dark:text-white">Proposed Resolution Matrix</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-zinc-500 bg-zinc-50 dark:bg-white/5 uppercase font-bold text-xs">
                                    <tr>
                                        <th className="px-6 py-3 rounded-l-lg">Party</th>
                                        <th className="px-6 py-3">Liability</th>
                                        <th className="px-6 py-3">Action</th>
                                        <th className="px-6 py-3 rounded-r-lg">Trust Score Impact</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                    <tr>
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">Retailer</td>
                                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">0%</td>
                                        <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">Full Refund Initiated</td>
                                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">No Change</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">Wholesaler</td>
                                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">0%</td>
                                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">Payment Released (Insurance)</td>
                                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">No Change</td>
                                    </tr>
                                    <tr className="bg-red-50 dark:bg-red-500/5">
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">Courier</td>
                                        <td className="px-6 py-4 text-red-400 font-bold">100%</td>
                                        <td className="px-6 py-4 text-red-400">Liable for Damages</td>
                                        <td className="px-6 py-4 text-red-400">-50 Points</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" className="border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-900 dark:text-white" onClick={handleManualReview}>
                                Request Manual Review
                            </Button>
                            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={handleConfirmResolution}>
                                Confirm Resolution
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function EvidenceColumn({ title, role, icon: Icon, color, data }: any) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
        purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    };

    return (
        <Card className={`bg-white dark:bg-black/40 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 transition-colors h-full flex flex-col shadow-sm dark:shadow-none`}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base">{title}</CardTitle>
                            <div className="text-xs text-zinc-500 uppercase font-bold">{role}</div>
                        </div>
                    </div>
                    {data.verified && <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-0"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                <div className="bg-zinc-50 dark:bg-white/5 p-3 rounded-lg text-sm text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-white/5 italic">
                    "{data.message}"
                </div>

                {data.evidence && data.evidence.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Evidence
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {data.evidence.map((url: string, i: number) => (
                                <div key={i} className="aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-white/5 relative group cursor-pointer">
                                    {url.includes('.mp4') ? (
                                        <div className="w-full h-full flex items-center justify-center bg-black">
                                            <span className="text-xs text-zinc-500">Video Evidence</span>
                                        </div>
                                    ) : (
                                        <img src={url} alt="Evidence" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-4 text-xs text-zinc-600 border-t border-white/5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Uploaded {data.timestamp}
                </div>
            </CardContent>
        </Card>
    );
}

function Clock({ className }: { className?: string }) {
    return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
