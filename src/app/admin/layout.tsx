import type { Metadata } from "next";
import Link from "next/link";
import { Building2, LayoutDashboard, Settings, Users, FileText, Banknote } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Portal | SeekFactory",
  description: "Secure Admin Portal for SeekFactory Operations",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col hidden md:flex shadow-sm">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <span className="font-bold text-white tracking-tighter">SF</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Admin<span className="text-orange-500">Portal</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem href="/admin/users" icon={<Users size={20} />} label="Users" />
          <NavItem href="/admin/manufacturers" icon={<Building2 size={20} />} label="Manufacturers" />
          <NavItem href="/admin/rfqs" icon={<FileText size={20} />} label="RFQs Queue" />
          <NavItem href="/admin/pricing" icon={<Banknote size={20} />} label="Pricing Config" />
        </nav>

        <div className="pt-6 border-t border-slate-200">
          <NavItem href="/admin/settings" icon={<Settings size={20} />} label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-200 bg-white/80 px-8 flex items-center justify-between sticky top-0 backdrop-blur-md z-10">
          <h1 className="text-sm font-medium text-slate-500">Admin Operations Center</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200"></div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all group"
    >
      <span className="group-hover:text-orange-400 transition-colors">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}
