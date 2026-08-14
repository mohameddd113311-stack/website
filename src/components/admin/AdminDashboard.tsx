'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/products';
import { Plus, Edit, Trash2, LogOut, Package, Flame, Sparkles, Check, X, ShieldCheck, ExternalLink } from 'lucide-react';

interface AdminDashboardProps {
  initialProducts: Product[];
}

export default function AdminDashboard({ initialProducts }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'ذكاء اصطناعي',
    price: '',
    originalPrice: '',
    billingPeriod: 'شهرياً',
    description: '',
    featuresText: '',
    badge: '',
    popular: false,
    iconType: 'gemini' as Product['iconType'],
    imageUrl: '',
    whatsappMsg: '',
  });

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'ذكاء اصطناعي',
      price: '',
      originalPrice: '',
      billingPeriod: 'شهرياً',
      description: '',
      featuresText: '',
      badge: '',
      popular: false,
      iconType: 'gemini',
      imageUrl: '',
      whatsappMsg: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category || 'ذكاء اصطناعي',
      price: product.price,
      originalPrice: product.originalPrice || '',
      billingPeriod: product.billingPeriod || 'شهرياً',
      description: product.description,
      featuresText: product.features.join('\n'),
      badge: product.badge || '',
      popular: Boolean(product.popular),
      iconType: product.iconType || 'custom',
      imageUrl: product.imageUrl || '',
      whatsappMsg: product.whatsappMsg || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      ...formData,
      features: formData.featuresText.split('\n').map(f => f.trim()).filter(Boolean),
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (editingProduct) {
          setProducts(products.map(p => p.id === editingProduct.id ? data.product : p));
          setSuccess('تم تعديل المنتج بنجاح');
        } else {
          setProducts([data.product, ...products]);
          setSuccess('تم إضافة المنتج بنجاح');
        }
        setIsModalOpen(false);
        router.refresh();
      } else {
        setError(data.error || 'حدث خطأ في تنفيذ العملية');
      }
    } catch (err) {
      setError('فشل الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت تأكد من إرادة حذف اشتراك "${name}"؟`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(products.filter(p => p.id !== id));
        setSuccess('تم حذف المنتج بنجاح');
        router.refresh();
      } else {
        alert(data.error || 'فشل حذف المنتج');
      }
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Admin Bar */}
      <div className="glass-card p-6 rounded-3xl border border-purple-500/30 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px]">
            <div className="w-full h-full bg-dark-bg rounded-[15px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">لوحة تحكم المنتجات والاشتراكات</h1>
            <p className="text-xs text-slate-400">إدارة وعرض وتحديث منتجات متجر AI Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href="/"
            target="_blank"
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:text-cyan-400 flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>معاينة الموقع</span>
          </a>

          <button
            onClick={openAddModal}
            className="btn-primary-glow px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{products.length}</div>
            <div className="text-xs text-slate-400">إجمالي المنتجات</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {products.filter(p => p.popular).length}
            </div>
            <div className="text-xs text-slate-400">الاشتراكات الأكثر طلباً</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">نشط 100%</div>
            <div className="text-xs text-slate-400">حالة التوجيه للواتساب</div>
          </div>
        </div>
      </div>

      {/* Products Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-cyan-400">
                  {product.category || 'عام'}
                </span>
                {product.badge && (
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-[11px] font-bold">
                    {product.badge}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
              <p className="text-slate-400 text-xs line-clamp-2 mb-4">{product.description}</p>
              
              <div className="text-2xl font-bold text-white mb-4">
                ${product.price} <span className="text-xs text-slate-400">/ {product.billingPeriod}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => openEditModal(product)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit className="w-3.5 h-3.5 text-cyan-400" />
                <span>تعديل</span>
              </button>

              <button
                onClick={() => handleDelete(product.id, product.name)}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                title="حذف المنتج"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-2xl rounded-3xl p-6 border border-purple-500/40 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم المنتج / الاشتراك *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: اشتراك Gemini Pro"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">القسم</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="ذكاء اصطناعي / تصميم"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">السعر ($) *</label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="15"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">السعر قبل الخصم ($)</label>
                  <input
                    type="text"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">دورة التجديد</label>
                  <input
                    type="text"
                    value={formData.billingPeriod}
                    onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value })}
                    placeholder="شهرياً / سنوياً"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الوصف المختصر *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف مختصر لمميزات وتفاصيل الخدمة..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">قائمة المميزات (ميزة في كل سطر)</label>
                <textarea
                  rows={4}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder={'وصول كامل لنموذج GPT-4o\nدعم تصدير بجودة 4K\nتفعيل رسمي 100%'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-400 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الشارة / Badge (اختياري)</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="الأكثر طلباً 🔥"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نوع الأيقونة الافتراضية</label>
                  <select
                    value={formData.iconType}
                    onChange={(e) => setFormData({ ...formData, iconType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-400"
                  >
                    <option value="gemini">Gemini Pro</option>
                    <option value="chatgpt">ChatGPT Plus</option>
                    <option value="capcut">CapCut Pro</option>
                    <option value="custom">مخصص</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رابط صورة المنتج (اختياري)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نص رسالة الواتساب المخصصة (اختياري)</label>
                <input
                  type="text"
                  value={formData.whatsappMsg}
                  onChange={(e) => setFormData({ ...formData, whatsappMsg: e.target.value })}
                  placeholder="مرحباً، أريد شراء اشتراك..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="popular"
                  checked={formData.popular}
                  onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="popular" className="text-xs font-semibold text-slate-300">
                  تمييز كمنتج شائع (Popular Card Shadow)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-glow px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2"
                >
                  {loading ? 'جاري الحفظ...' : (editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
