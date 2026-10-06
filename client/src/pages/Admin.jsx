import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Login from './admin/Login';
import AdminShell from './admin/AdminShell';
import AdminProducts from './admin/AdminProducts';
import AdminSettings from './admin/AdminSettings';
import AdminInbox from './admin/AdminInbox';
import AdminOverview from './admin/AdminOverview';

export default function Admin() {
  const { isAdmin } = useApp();
  const [checking, setChecking] = useState(false);

  if (!isAdmin) return <Login />;

  return (
    <AdminShell onBusy={setChecking}>
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="inbox" element={<AdminInbox />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
      {checking && null}
    </AdminShell>
  );
}
