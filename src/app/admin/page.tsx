import React from 'react';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { getProducts } from '@/lib/products';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const revalidate = 0;

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect('/admin/login');
  }

  const products = getProducts();

  return <AdminDashboard initialProducts={products} />;
}
