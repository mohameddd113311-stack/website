'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/products';
import {
  Plus, Edit, Trash2, LogOut, Package, Flame, Sparkles, Check, X,
  ShieldCheck, ExternalLink, Settings, Phone, Facebook, Upload, Image as ImageIcon,
  Download, RefreshCw, Database, CheckCircle2, DollarSign
} from 'lucide-react';

import { useApp } from '@/context/AppContext';
import { getStoredProducts, setStoredProducts, setStoredSettings } from '@/lib/clientStorage';

interface AdminDashboardProps {
  initialProducts: Product[];
}

export default function AdminDashboard({ initialProducts }: AdminDashboardProps) {
  const { settings, updateSettings } = useApp();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    whatsappNumber: settings.whatsappNumber,
    facebookUrl: settings.facebookUrl,
    usdToEgpRate: settings.usdToEgpRate || 50,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Active Tab: 'products' | 'settings' | 'backup'
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'backup'>('products');
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');
  const [backupError, setBackupError] = useState('');

  // Product Form State
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

  // Sync settings state when context updates
  useEffect(() => {
    setSettingsForm({
      whatsappNumber: settings.whatsappNumber,
      facebookUrl: settings.facebookUrl,
      usdToEgpRate: settings.usdToEgpRate || 50,
    });
  }, [settings]);





  // Fetch latest products from server API on mount with cache busting
  useEffect(() => {
    fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  const notifyProductsUpdated = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('products_updated'));
    }
  };

  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    setBackupError('');
    setBackupMessage('');
    try {
      const res = await fetch('/api/admin/backup');
      const data = await res.json();
      if (res.ok && data.success) {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_studio_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setBackupMessage('تم تصدير النسخة الاحتياطية بنجاح واحتفاظها بكافة المنتجات!');
      } else {
        setBackupError(data.error || 'فشل تصدير النسخة الاحتياطية');
      }
    } catch (err) {
      setBackupError('حدث خطأ أثناء تصدير البيانات');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackupLoading(true);
    setBackupError('');
    setBackupMessage('');

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed || (!parsed.products && !Array.isArray(parsed))) {
        throw new Error('تنسيق ملف النسخة الاحتياطية غير صالح');
      }

      const productsToRestore = Array.isArray(parsed) ? parsed : parsed.products;
      const settingsToRestore = parsed.settings;

      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: productsToRestore, settings: settingsToRestore }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (Array.isArray(data.products)) {
          setProducts(data.products);
          notifyProductsUpdated();
        }
        if (data.settings) {
          updateSettings(data.settings);
        }
        setBackupMessage('تم استعادة النسخة الاحتياطية وتحديث المنتجات والموقع بنجاح!');
        router.refresh();
      } else {
        setBackupError(data.error || 'فشل استعادة النسخة الاحتياطية');
      }
    } catch (err: any) {
      setBackupError(err.message || 'خطأ في قراءة ملف JSON');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleForceSyncServer = async () => {
    setBackupLoading(true);
    setBackupError('');
    setBackupMessage('');
    try {
      const res = await fetch('/api/products/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBackupMessage('تم إعادة مزامنة وتثبيت كافة المنتجات في السيرفر بنجاح!');
      } else {
        setBackupError(data.error || 'فشل المزامنة');
      }
    } catch (err) {
      setBackupError('خطأ أثناء المزامنة بالسيرفر');
    } finally {
      setBackupLoading(false);
    }
  };

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
      featuresText: product.features ? product.features.join('\n') : '',
      badge: product.badge || '',
      popular: Boolean(product.popular),
      iconType: product.iconType || 'custom',
      imageUrl: product.imageUrl || '',
      whatsappMsg: product.whatsappMsg || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  // Image Upload handler: First uploads to Cloud Storage (/api/admin/upload), with Canvas compression fallback
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 10 ميجابايت');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      // 1. Attempt uploading directly to Cloud Storage API endpoint
      const bodyFormData = new FormData();
      bodyFormData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: bodyFormData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
        setUploadingImage(false);
        return;
      }
    } catch (err) {
      console.warn("Cloud storage endpoint unavailable, using direct optimization fallback", err);
    }

    // 2. Fallback: Optimize and compress locally using Canvas
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawResult = event.target?.result as string;
      if (!rawResult) {
        setUploadingImage(false);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setFormData(prev => ({ ...prev, imageUrl: compressedDataUrl }));
        } else {
          setFormData(prev => ({ ...prev, imageUrl: rawResult }));
        }
        setUploadingImage(false);
      };
      img.onerror = () => {
        setFormData(prev => ({ ...prev, imageUrl: rawResult }));
        setUploadingImage(false);
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  };



  const handleSubmitProduct = async (e: React.FormEvent) => {
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
        let updatedList: Product[];
        if (editingProduct) {
          updatedList = products.map(p => p.id === editingProduct.id ? data.product : p);
          setProducts(updatedList);
          setSuccess('تم تعديل المنتج بنجاح وحفظ البيانات للزوار');
        } else {
          updatedList = [data.product, ...products];
          setProducts(updatedList);
          setSuccess('تم إضافة المنتج بنجاح وحفظ البيانات للزوار');
        }
        notifyProductsUpdated();
        setIsModalOpen(false);
        router.refresh();
      } else {
        setError(data.error || 'حدث خطأ في تنفيذ العملية');
      }
    } catch (err) {
      setError('فشل الاتصال بالسيرفر، ولكن تم التحديث احتياطياً');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`هل أنت تأكد من رغبتك في حذف اشتراك "${name}"؟`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedList = products.filter(p => p.id !== id);
        setProducts(updatedList);
        notifyProductsUpdated();
        setSuccess('تم حذف المنتج بنجاح');
        router.refresh();
      } else {
        alert(data.error || 'فشل حذف المنتج');
      }
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsSuccess('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        updateSettings(data.settings);
        setSettingsSuccess('تم حفظ إعدادات المتجر (رقم الواتساب ورابط الفيسبوك) بنجاح!');
      } else {
        setSettingsError(data.error || 'حدث خطأ أثناء حفظ الإعدادات');
      }
    } catch (err) {
      setSettingsError('فشل الاتصال بالسيرفر');
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Admin Top Header */}
      <div className="glass-card p-6 rounded-3xl border border-purple-500/30 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px]">
            <div className="w-full h-full bg-dark-bg rounded-[15px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">لوحة تحكم وإدارة AI Studio</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                حفظ دائم ومستمر
              </span>
            </div>
            <p className="text-xs text-slate-400">إدارة المنتجات، التعديل، الحفظ، ورقم الواتساب والفيسبوك</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap justify-end">
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

      {/* Tabs Navigation */}
      <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4 flex-wrap">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'glass-card border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>إدارة المنتجات والاشتراكات ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'glass-card border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>إعدادات المتجر (الواتساب والفيسبوك)</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'backup'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
              : 'glass-card border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>النسخ الاحتياطي والاستعادة</span>
        </button>
      </div>

      {/* Global Notifications */}
      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* TAB 1: PRODUCTS LIST */}
      {activeTab === 'products' && (
        <>
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
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-white dir-ltr">{settings.whatsappNumber}</div>
                <div className="text-xs text-slate-400">رقم تحويل الواتساب الحسابي</div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                <div>
                  {/* Image or Icon Graphic preview */}
                  {product.imageUrl ? (
                    <div className="w-full h-36 rounded-2xl overflow-hidden mb-4 bg-slate-900 border border-slate-800">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-2xl mb-4 bg-slate-900/60 border border-slate-800/80 flex items-center justify-center text-cyan-400">
                      <Sparkles className="w-8 h-8" />
                    </div>
                  )}

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
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    title="حذف المنتج"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* TAB 2: STORE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto glass-card rounded-3xl p-8 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <Settings className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">إعدادات تحويل المتجر</h2>
              <p className="text-xs text-slate-400">تحديث رقم الواتساب ورابط صفحة الفيسبوك للموقع ككل</p>
            </div>
          </div>

          {settingsSuccess && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              {settingsSuccess}
            </div>
          )}

          {settingsError && (
            <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {settingsError}
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>رقم الواتساب للتحويل المباشر (مع كود الدولة) *</span>
              </label>
              <input
                type="text"
                required
                value={settingsForm.whatsappNumber}
                onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                placeholder="مثال: 201021510826"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-400 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                تأكد من كتابة الرقم بالأرقام المباشرة دون علامة + (مثال لمصر: 201021510826)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-400" />
                <span>رابط صفحة الفيسبوك *</span>
              </label>
              <input
                type="url"
                required
                value={settingsForm.facebookUrl}
                onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                placeholder="https://www.facebook.com/share/..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-400 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                الرابط الذي سيتم التوجيه إليه عند النقر على أيقونة الفيسبوك بالموقع
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>سعر الصرف (كم جنيه مصري مقابل 1 دولار أمريكي) *</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={settingsForm.usdToEgpRate}
                onChange={(e) => setSettingsForm({ ...settingsForm, usdToEgpRate: parseFloat(e.target.value) || 0 })}
                placeholder="القيمة الافتراضية: 50"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-400 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                القيمة الافتراضية هي 50 جنيه لكل 1 دولار. تضمن التحويل التلقائي لأسعار كافة المنتجات بالجنيه المصري (EGP) للزوار.
              </p>
            </div>



            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={settingsLoading}
                className="btn-primary-glow w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
              >
                {settingsLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات الفورية'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="glass-card rounded-3xl p-8 border border-cyan-500/30">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <Database className="w-6 h-6 text-cyan-400" />
              <div>
                <h2 className="text-xl font-bold text-white">إدارة النسخ الاحتياطي والاستعادة الدائمة</h2>
                <p className="text-xs text-slate-400">تصدير بيانات المنتجات والإعدادات في ملف JSON للحفاظ عليها دائماً</p>
              </div>
            </div>

            {backupMessage && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between">
                <span>{backupMessage}</span>
                <button onClick={() => setBackupMessage('')}><X className="w-4 h-4" /></button>
              </div>
            )}

            {backupError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between">
                <span>{backupError}</span>
                <button onClick={() => setBackupError('')}><X className="w-4 h-4" /></button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Box */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                    <Download className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">تصدير نسخة احتياطية (JSON)</h3>
                  <p className="text-xs text-slate-400 mb-6">
                    تحميل ملف كافّة المنتجات والاشتراكات الحالية والإعدادات لحفظه بأمان على جهازك.
                  </p>
                </div>
                <button
                  onClick={handleDownloadBackup}
                  disabled={backupLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  <span>{backupLoading ? 'جاري التحميل...' : 'تحميل النسخة الاحتياطية'}</span>
                </button>
              </div>

              {/* Restore Box */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">استعادة نسخة احتياطية</h3>
                  <p className="text-xs text-slate-400 mb-6">
                    رفع ملف JSON مسبق لاستعادة المنتجات والإعدادات فوراً على السيرفر والموقع.
                  </p>
                </div>
                <label className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors cursor-pointer text-center">
                  <Upload className="w-4 h-4" />
                  <span>{backupLoading ? 'جاري الاستعادة...' : 'اختيار ملف النسخة الاحتياطية'}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreBackupFile}
                    disabled={backupLoading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Sync Button Box */}
            <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-300">مزامنة البيانات الحالية بالسيرفر</h4>
                <p className="text-[11px] text-slate-500">إعادة تأكيد وتثبيت المنتجات الحالية المفتوحة في اللوحة بالسيرفر فوراً.</p>
              </div>
              <button
                onClick={handleForceSyncServer}
                disabled={backupLoading}
                className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${backupLoading ? 'animate-spin' : ''}`} />
                <span>إعادة مزامنة السيرفر الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

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

            <form onSubmit={handleSubmitProduct} className="space-y-4">
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
                  <label className="block text-xs font-bold text-slate-300 mb-1">السعر بالدولار ($) *</label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="15"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-cyan-400 mt-1 block">
                    سيظهر بالموقع بالعربي: {formData.price ? (parseFloat(formData.price) * 50) || 0 : 0} ج.م
                  </span>
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

              {/* IMAGE SELECTION & UPLOAD */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-cyan-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>صورة المنتج (رفع ملف أو وضع رابط)</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      {uploadingImage ? 'جاري رفع الصورة للسحابة...' : 'رفع صورة من جهازك'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={handleImageFileUpload}
                      className="w-full text-xs text-slate-300 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">أو كتابة رابط صورة مباشر</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Live Preview Box */}
                {formData.imageUrl && (
                  <div className="pt-2">
                    <span className="text-[11px] text-slate-400 font-semibold mb-1 block">معاينة صورة المنتج:</span>
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-cyan-500/40 relative bg-black">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-red-600 text-white text-xs"
                        title="إزالة الصورة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
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
                  <label className="block text-xs font-bold text-slate-300 mb-1">نوع الأيقونة (في حال عدم وجود صورة)</label>
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
