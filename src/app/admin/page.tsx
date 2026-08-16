import React from 'react';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { getProductsAsync } from '@/lib/products';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect('/admin/login');
  }

  const products = await getProductsAsync();

  return <AdminDashboard initialProducts={products} />;
}

