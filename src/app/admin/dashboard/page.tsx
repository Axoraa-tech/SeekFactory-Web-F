"use client";

import { useState, useEffect } from "react";
import { Building2, Users, FileText, AlertCircle, ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/shared/api/admin-api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedFactories: 0,
    pendingRfqs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboardStats()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch dashboard stats", err);
        setLoading(false);
      });
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">Welcome to the SeekFactory Admin Operations Center.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Users" 
          value={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalUsers.toLocaleString()} 
          trend="+12% from last month" 
          icon={<Users className="w-5 h-5 text-blue-500" />} 
        />
        <MetricCard 
          title="Verified Factories" 
          value={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.verifiedFactories.toLocaleString()} 
          trend="+5% from last month" 
          icon={<Building2 className="w-5 h-5 text-green-500" />} 
        />
        <MetricCard 
          title="Pending RFQs" 
          value={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.pendingRfqs.toLocaleString()} 
          trend={stats.pendingRfqs + " require immediate attention"} 
          icon={<FileText className="w-5 h-5 text-orange-500" />} 
          alert={stats.pendingRfqs > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-slate-900">Recent Activity</h3>
            <button className="text-sm text-slate-500 hover:text-slate-900 transition-colors">View All</button>
          </div>
          <div className="space-y-4">
            <ActivityItem 
              action="New Factory Registration" 
              entity="Guangzhou Textiles Ltd." 
              time="2 minutes ago" 
            />
            <ActivityItem 
              action="Subscription Upgraded" 
              entity="Shenzhen Precision CNC -> Pro Tier" 
              time="1 hour ago" 
            />
            <ActivityItem 
              action="RFQ Created" 
              entity="Bulk Order for Electronics Components" 
              time="3 hours ago" 
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/admin/manufacturers" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors group">
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Verify Factories</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </Link>
            <Link href="/admin/pricing" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors group">
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Manage Pricing</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon, alert = false }: { title: string; value: React.ReactNode; trend: string; icon: React.ReactNode; alert?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden group hover:border-slate-300 transition-colors shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-2xl font-bold text-slate-900 mb-1">{value}</h4>
        <div className="flex items-center gap-1.5">
          {alert && <AlertCircle className="w-3.5 h-3.5 text-orange-500" />}
          <span className={`text-xs ${alert ? 'text-orange-500' : 'text-slate-500'}`}>{trend}</span>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ action, entity, time }: { action: string; entity: string; time: string }) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="w-2 h-2 mt-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]"></div>
      <div>
        <p className="text-sm font-medium text-slate-900">{action}</p>
        <p className="text-xs text-slate-500 mt-0.5">{entity}</p>
        <p className="text-xs text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  );
}
