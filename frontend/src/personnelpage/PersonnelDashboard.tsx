import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ClipboardList, Settings } from 'lucide-react';
import { Sidebar } from '../components/shared/Sidebar';
import { Header } from '../components/shared/Header';
import { Card, StatCard } from '../components/shared/Card';
import { DataTable } from '../components/shared/DataTable';
import { EmptyState } from '../components/shared/EmptyState';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiService';

function PersonnelHome() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (profile?.id) api.get(`/api/bookings/personnel/${profile.id}`).then(r => setBookings(r.data || [])).catch(() => {}).finally(() => setLoading(false));
    else setLoading(false);
  }, [profile]);
  const activeJobs = bookings.filter(b => b.status === 'in_progress').length;
  const completedJobs = bookings.filter(b => b.status === 'completed').length;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Active Jobs" value={activeJobs} icon={<ClipboardList className="w-5 h-5" />} color="green" />
        <StatCard title="Completed Jobs" value={completedJobs} icon={<ClipboardList className="w-5 h-5" />} color="navy" />
      </div>
    </div>
  );
}

function PersonnelBookings() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (profile?.id) api.get(`/api/bookings/personnel/${profile.id}`).then(r => setBookings(r.data || [])).catch(() => {}).finally(() => setLoading(false));
    else setLoading(false);
  }, [profile]);
  return (
    <DataTable columns={[
      { key: 'service_type', label: 'Service', sortable: true },
      { key: 'scheduled_date', label: 'Date', sortable: true },
      { key: 'service_address', label: 'Address' },
      { key: 'status', label: 'Status', render: (item: any) => {
        const cls: Record<string, string> = { in_progress: 'badge-in-progress', completed: 'badge-completed', confirmed: 'badge-confirmed' };
        return <span className={cls[item.status] || 'badge'}>{item.status?.replace('_', ' ')}</span>;
      }},
    ]} data={bookings} loading={loading} emptyTitle="No assigned bookings" />
  );
}

function PersonnelProfile() {
  const { profile } = useAuth();
  if (!profile) return <EmptyState title="Profile not loaded" />;
  return (
    <Card>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">My Profile</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {[['First Name', profile.first_name], ['Last Name', profile.last_name], ['Email', profile.email], ['Phone', (profile as any).phone || '—']].map(([label, val]) => (
          <div key={label as string}><p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{val as string}</p></div>
        ))}
      </div>
    </Card>
  );
}

export default function PersonnelDashboard() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <Sidebar role="personnel" collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header />
        <main className="p-6">
          <Routes>
            <Route index element={<PersonnelHome />} />
            <Route path="bookings" element={<PersonnelBookings />} />
            <Route path="profile" element={<PersonnelProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
