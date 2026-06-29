import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop, type Size } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import * as XLSX from 'xlsx';
import { api } from '@/lib/api';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import {
  Package,
  ShoppingBag,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  LogOut,
  Clock,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Menu,
  X,
  Heart,
  TrendingUp,
  ImageIcon,
  Upload,
  Link,
  Truck,
  ExternalLink,
  Calendar,
  FileSpreadsheet,
  Download,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose
} from 'lucide-react';
import { SITE_CONFIG } from '@/config';

const CATEGORIES = ['Boquet', 'Hampers', 'Jewellery', 'Mini Boquet', 'Mini Hampers', 'Accesories', 'Personalised'];

const SUBCATEGORIES_MAP: Record<string, string[]> = {
  'Boquet': ['Polaroid boquets', 'jewellery boquets', 'hair accesories boquet', 'hotwheels boquet', 'choclate boquet'],
  'Hampers': ['Premium Hampers', 'Self Care Hampers', 'Chocolate Hampers', 'Celebration Hampers'],
  'Jewellery': ['earing', 'bracelet', 'anlet', 'necklace', 'ring'],
  'Mini Boquet': ['Polaroid boquets', 'jewellery boquets', 'hair accesories boquet', 'hotwheels boquet', 'choclate boquet'],
  'Mini Hampers': ['Polaroid boquets', 'jewellery boquets', 'hair accesories boquet', 'hotwheels boquet', 'choclate boquet'],
  'Accesories': [],
  'Personalised': ['magazines', 'personalised tshirts', 'mobile covers', 'mug / cups', 'keychains']
};

const OCCASIONS = [
  'birthday', 'anniversiry', 'engagement', 'baby shower', 'proposal', 'mothers day', 'fathers day', 
  'valentines week days', 'diwali', 'eid', 'rakhi', 'holi', 'christmas', 'sisters day', 
  'boyfriends day', 'girlfriends day'
];

const GIFT_FOR_OPTIONS = ['male', 'female'];


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'contacts' | 'profile'>('products');
  const [data, setData] = useState<{ products: any[], orders: any[], contacts: any[], profile: any }>({
    products: [],
    orders: [],
    contacts: [],
    profile: null
  });
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: '',
    subCategory: '',
    occasion: '',
    giftFor: '',
    size: '',
    featured: false,
    isSoldOut: false
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();

    let interval: NodeJS.Timeout;
    if (activeTab === 'orders') {
      interval = setInterval(async () => {
        try {
          const orders = await api.getAdminOrders(token!);
          setData(prev => ({ ...prev, orders }));
        } catch (error) {
          console.error("Polling orders failed:", error);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [token, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsResponse, orders, contacts, profile] = await Promise.all([
        api.getProductsPaginated({ limit: 1000 }),
        api.getAdminOrders(token!),
        api.getAdminContacts(token!),
        api.getAdminProfile(token!)
      ]);
      setData({ products: productsResponse.products, orders, contacts, profile });
    } catch (error) {
      toast.error('Failed to fetch data');
      if (error instanceof Error && error.message === 'Unauthorized') {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const CLOUDINARY_CLOUD_NAME = 'dh0y5gfiu';
  const CLOUDINARY_UPLOAD_PRESET = 'n1cagrkp';

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image must be under 20MB');
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('quality', 'auto:best');

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      const result = await new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
          else reject(new Error('Upload failed'));
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
        xhr.send(formData);
      });

      setNewProduct(prev => ({ ...prev, image: result.secure_url }));
      toast.success('Image uploaded at full quality!');
    } catch (err) {
      toast.error('Image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateAdminProduct(token!, editingProduct.id, newProduct);
        toast.success('Product updated');
      } else {
        await api.createAdminProduct(token!, newProduct);
        toast.success('Product created');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setNewProduct({ name: '', price: '', description: '', image: '', category: '', subCategory: '', occasion: '', giftFor: '', size: '', featured: false, isSoldOut: false });
      fetchData();
    } catch {
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteAdminProduct(token!, id);
      toast.success('Product deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (id: string, status?: string, trackingId?: string) => {
    // Optimistically update the UI
    setData(prev => ({
      ...prev,
      orders: prev.orders.map(o => o.id === id ? { ...o, status: status || o.status, trackingId: trackingId || o.trackingId } : o)
    }));

    try {
      await api.updateAdminOrder(token!, id, status, trackingId);
      if (status) toast.success(`Order status updated to ${status}`);
      if (trackingId) toast.success(`Tracking ID updated! Email sent.`);
    } catch {
      toast.error('Failed to update order');
      // Revert by re-fetching if the API call fails
      fetchData();
    }
  };

  const handleUpdateOrderItemStatus = async (itemId: string, status: string) => {
    try {
      await api.updateOrderItemStatus(itemId, status, token!);
      toast.success("Item status updated successfully!");
      
      // Update local state immediately
      setData(prev => {
        const updatedOrders = prev.orders.map(order => {
          const updatedItems = order.items.map((item: any) => {
            if (item.id === itemId) {
              return { ...item, status };
            }
            return item;
          });
          return { ...order, items: updatedItems };
        });
        return { ...prev, orders: updatedOrders };
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update item status");
    }
  };

  const handleDownloadAssetPDF = async (order: any) => {
    const images: string[] = [];
    order.items?.forEach((item: any) => {
      if (item.customImage) {
        let urls: string[] = [];
        if (item.customImage.startsWith('[')) {
          try {
            urls = JSON.parse(item.customImage);
          } catch {
            urls = [item.customImage];
          }
        } else {
          urls = [item.customImage];
        }
        images.push(...urls);
      }
    });

    if (images.length === 0) {
      toast.error("No custom images uploaded for this order.");
      return;
    }

    const toastId = toast.loading("Compiling high-resolution PDF... Please wait.");

    try {
      const doc = new jsPDF();
      
      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        let format = "JPEG";
        if (imageUrl.toLowerCase().endsWith(".png")) format = "PNG";

        if (i > 0) {
          doc.addPage();
        }

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.addImage(base64Data, format, 10, 10, pageWidth - 20, pageHeight - 20, undefined, 'NONE');
      }

      doc.save(`Order-${order.id.slice(0, 8)}-Photos.pdf`);
      toast.success("PDF Downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("PDF Compilation failed:", err);
      toast.error("Failed to generate PDF.", { id: toastId });
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.deleteAdminContact(token!, id);
      toast.success('Message deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete message');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F3EE]">
      <div className="text-center">
        <Heart size={32} className="text-primary mx-auto mb-3 animate-pulse" fill="currentColor" />
        <p className="text-foreground/60 font-body text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  // Bulk Excel Upload Handler
  const handleBulkExcelUpload = async (file: File) => {
    if (!file) return;
    setBulkUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        toast.error('Excel file is empty or has no valid rows');
        return;
      }

      const result = await api.bulkCreateAdminProducts(token!, rows);
      toast.success(`✅ ${result.count} products uploaded successfully!`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Bulk upload failed');
    } finally {
      setBulkUploading(false);
    }
  };

  // Download Excel Template
  const handleDownloadTemplate = () => {
    const headers = [['name','price','description','image','category','subCategory','occasion','giftFor','size','featured','isSoldOut']];
    const exampleRow = [['Example Bouquet','999','A beautiful polaroid bouquet','https://example.com/img.jpg','Boquet','Polaroid boquets','birthday','female','Medium','false','false']];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...exampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'memory-knot-products-template.xlsx');
    toast.success('Template downloaded!');
  };

  return (
    <div className="min-h-screen bg-[#F8F3EE] flex flex-col">
      {/* Lightbox for profile image */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-white/70" onClick={() => setLightboxImage(null)}>
            <X size={28} />
          </button>
          <img
            src={lightboxImage}
            alt="Profile"
            className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-border/60 px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-primary" fill="currentColor" />
            <div>
              <h1 className="font-heading font-bold text-base text-foreground leading-tight">{SITE_CONFIG.name}</h1>
              <p className="text-[10px] text-muted-foreground font-body hidden sm:block">Admin Dashboard</p>
            </div>
          </div>
        </div>
        {/* Mobile logout in header */}
        <button
          onClick={handleLogout}
          className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-xs font-medium text-foreground/70 hover:text-primary border border-border/60"
        >
          <LogOut size={15} />
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 bg-white border-r border-border/60 p-5 shadow-elevated flex flex-col gap-2"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-primary" fill="currentColor" />
                <span className="font-heading font-bold text-foreground">Admin Menu</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <NavItems
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
              counts={{ products: data.products.length, orders: data.orders.length, contacts: data.contacts.length }}
            />
          </aside>
        </div>
      )}

      <div className="flex flex-1">
        {/* Sidebar (Desktop) */}
        <aside
          className={`bg-white border-r border-border/60 hidden lg:flex flex-col h-full sticky top-[61px] transition-all duration-300 overflow-hidden ${
            sidebarCollapsed ? 'w-16 p-2' : 'w-60 p-4'
          }`}
          style={{ height: 'calc(100vh - 61px)' }}
        >
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className={`flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#F8F3EE] transition-colors text-muted-foreground hover:text-foreground mb-3 ${
              sidebarCollapsed ? 'mx-auto' : 'ml-auto'
            }`}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {!sidebarCollapsed && (
            <>
              {/* Admin Avatar */}
              {data.profile?.profileImage ? (
                <button
                  onClick={() => setLightboxImage(data.profile.profileImage)}
                  className="flex items-center gap-3 mb-3 p-2 rounded-xl hover:bg-[#F8F3EE] transition-colors group w-full text-left"
                  title="Click to view profile photo"
                >
                  <div className="relative flex-shrink-0">
                    <img src={data.profile.profileImage} alt="Admin" className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" />
                    <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{data.profile.username}</p>
                    <p className="text-[10px] text-muted-foreground">Administrator</p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-3 mb-3 p-2">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{data.profile?.username || 'Admin'}</p>
                    <p className="text-[10px] text-muted-foreground">Administrator</p>
                  </div>
                </div>
              )}

              <div className="border-t border-border/40 pt-3 mb-1" />

              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Products', value: data.products.length, icon: Package },
                  { label: 'Orders', value: data.orders.length, icon: ShoppingBag },
                  { label: 'Messages', value: data.contacts.length, icon: MessageSquare },
                ].map(s => (
                  <div key={s.label} className="bg-[#F8F3EE] rounded-lg p-2 text-center">
                    <p className="font-bold text-foreground text-lg">{s.value}</p>
                    <p className="text-[9px] text-muted-foreground font-body">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Collapsed avatar */}
          {sidebarCollapsed && data.profile?.profileImage && (
            <button
              onClick={() => setLightboxImage(data.profile.profileImage)}
              className="w-9 h-9 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary/20 flex-shrink-0"
              title="View profile photo"
            >
              <img src={data.profile.profileImage} alt="Admin" className="w-full h-full object-cover" />
            </button>
          )}

          <NavItems
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            counts={{ products: data.products.length, orders: data.orders.length, contacts: data.contacts.length }}
            collapsed={sidebarCollapsed}
          />

          {/* Sidebar Logout */}
          <div className="mt-auto pt-4 border-t border-border/40">
            <button
              onClick={handleLogout}
              id="admin-logout"
              className={`flex items-center rounded-lg transition-all w-full hover:bg-red-50 text-foreground/70 hover:text-red-500 ${
                sidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5'
              }`}
              title={sidebarCollapsed ? 'Logout' : undefined}
            >
              <LogOut size={18} />
              {!sidebarCollapsed && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-5 lg:p-8 max-w-[1600px] w-full">
          {/* Products View */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-foreground">Manage Products</h2>
                  <p className="text-muted-foreground text-sm font-body mt-0.5">Add, edit, or remove gift products</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    id="add-product-btn"
                    onClick={() => {
                      setEditingProduct(null);
                      setNewProduct({ name: '', price: '', description: '', image: '', category: '', subCategory: '', occasion: '', giftFor: '', size: '', featured: false, isSoldOut: false });
                      setShowProductModal(true);
                    }}
                    className="bg-primary text-white px-4 py-2.5 rounded-lg font-medium font-body flex items-center gap-2 hover:bg-primary/90 shadow-soft text-sm"
                  >
                    <Plus size={16} />
                    Add Product
                  </button>
                </div>
              </div>

              {/* Bulk Excel Upload Panel */}
              <div className="bg-white rounded-xl border border-border/60 shadow-card p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <FileSpreadsheet size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-foreground text-sm">Bulk Upload via Excel</h3>
                      <p className="text-xs text-muted-foreground font-body mt-0.5">Upload an Excel file to add multiple products at once. Download the template to get started.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleDownloadTemplate}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 text-xs font-medium text-foreground/70 hover:bg-secondary transition-colors"
                    >
                      <Download size={14} />
                      Template
                    </button>
                    <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      bulkUploading
                        ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}>
                      {bulkUploading ? (
                        <><Package size={14} className="animate-spin" /> Uploading...</>
                      ) : (
                        <><Upload size={14} /> Upload Excel</>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept=".xlsx,.xls,.csv"
                        disabled={bulkUploading}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) { handleBulkExcelUpload(file); e.target.value = ''; }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-border/60 overflow-x-auto shadow-card">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead className="bg-[#F8F3EE] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3.5">Image</th>
                      <th className="px-5 py-3.5">Name</th>
                      <th className="px-5 py-3.5">Price</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {data.products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F8F3EE]/50 transition-colors">
                        <td className="px-5 py-4">
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&q=80'}
                            className="w-12 h-12 rounded-lg object-cover border border-border/50"
                          />
                        </td>
                        <td className="px-5 py-4 font-medium text-sm text-foreground">{p.name}</td>
                        <td className="px-5 py-4 text-sm font-bold text-primary">₹{Number(p.price).toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2 flex-wrap">
                            {p.featured ? (
                              <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase">Featured</span>
                            ) : (
                              <span className="px-2.5 py-1 bg-secondary text-muted-foreground text-[10px] font-bold rounded-full uppercase">Standard</span>
                            )}
                            {p.isSoldOut && (
                              <span className="px-2.5 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase">Sold Out</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setNewProduct({
                                  name: p.name,
                                  price: p.price.toString(),
                                  description: p.description || '',
                                  image: p.image || '',
                                  category: p.category || '',
                                  subCategory: p.subCategory || '',
                                  occasion: p.occasion || '',
                                  giftFor: p.giftFor || '',
                                  size: p.size || '',
                                  featured: p.featured,
                                  isSoldOut: p.isSoldOut || false
                                });
                                setShowProductModal(true);
                              }}
                              className="w-8 h-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="w-8 h-8 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors flex items-center justify-center"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {data.products.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-14 text-center text-muted-foreground font-body text-sm">
                          <Package size={32} className="mx-auto mb-2 opacity-20" />
                          No products yet. Add your first gift!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders View */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              {!selectedOrderId ? (
                <>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-foreground">Recent Orders</h2>
                    <p className="text-muted-foreground text-sm font-body mt-0.5">Review and manage your gift orders</p>
                  </div>

                  <div className="space-y-5">
                    {data.orders.map((order) => (
                      <div 
                        key={order.id} 
                        onClick={() => setSelectedOrderId(order.id)}
                        className="bg-white border border-border/60 rounded-xl p-5 shadow-card hover:border-primary/20 hover:shadow-soft transition-all cursor-pointer group"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                              <ShoppingBag size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-foreground">Order #{order.id.slice(0, 8)}</p>
                              <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                <Clock size={11} />
                                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Amount</p>
                              <p className="text-primary font-bold text-sm">₹{Number(order.totalAmount).toLocaleString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                              order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              order.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                              'bg-primary/10 text-primary'
                            }`}>
                              {order.status}
                            </span>
                            <span className="text-[10px] font-bold text-primary group-hover:underline flex items-center gap-1 ml-2">
                              View details →
                            </span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border/50 text-xs text-muted-foreground font-body">
                          <div>
                            <span className="font-semibold text-foreground">Customer:</span> {order.customerName} ({order.customerPhone})
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Items:</span> {order.items?.length || 0} items purchased
                          </div>
                        </div>
                      </div>
                    ))}
                    {data.orders.length === 0 && (
                      <div className="p-14 text-center text-muted-foreground bg-white rounded-xl border border-dashed border-border font-body">
                        <ShoppingBag size={32} className="mx-auto mb-2 opacity-20" />
                        No orders placed yet.
                      </div>
                    )}
                  </div>
                </>
              ) : (() => {
                const order = data.orders.find(o => o.id === selectedOrderId);
                if (!order) {
                  setSelectedOrderId(null);
                  return null;
                }

                const hasCustomImages = order.items?.some((item: any) => item.customImage);

                return (
                  <div className="space-y-6">
                    {/* Back Button and Action Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <button
                        onClick={() => setSelectedOrderId(null)}
                        className="px-4 py-2 border border-border bg-white text-foreground hover:bg-secondary rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm max-w-fit"
                      >
                        ← Back to Orders
                      </button>

                      {hasCustomImages && (
                        <button
                          onClick={() => handleDownloadAssetPDF(order)}
                          className="px-5 py-2.5 bg-primary text-white hover:bg-primary/95 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-soft transition-all"
                        >
                          <ImageIcon size={14} /> Download Assets PDF
                        </button>
                      )}
                    </div>

                    {/* Consolidated Details Panel */}
                    <div className="bg-white border border-border/60 rounded-2xl p-6 shadow-card space-y-6">
                      {/* Title Info */}
                      <div className="flex flex-col md:flex-row justify-between border-b border-border/40 pb-5 gap-4">
                        <div>
                          <h3 className="font-heading text-xl font-bold text-foreground">Order Details</h3>
                          <p className="text-xs text-muted-foreground font-body mt-1">ID: <strong className="text-foreground">{order.id}</strong></p>
                          <p className="text-xs text-muted-foreground font-body">Placed on: {new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Order Status</span>
                            <div className="flex items-center gap-2 mt-1">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="APPROVED">APPROVED</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer & Address Details */}
                      <div className="grid md:grid-cols-2 gap-6 bg-[#FCFAF7] border border-border/40 p-5 rounded-2xl">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <User size={13} className="text-primary" /> Customer Base Details
                          </h4>
                          <div className="text-xs font-body space-y-1 text-foreground/80">
                            <p><strong className="text-foreground font-heading">Name:</strong> {order.customerName}</p>
                            <p><strong className="text-foreground font-heading">Email:</strong> {order.customerEmail || 'No email provided'}</p>
                            <p><strong className="text-foreground font-heading">Phone:</strong> {order.customerPhone}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <MapPin size={13} className="text-primary" /> Delivery Information
                          </h4>
                          <div className="text-xs font-body space-y-1 text-foreground/80">
                            <p><strong className="text-foreground font-heading">Address:</strong> {order.address}</p>
                            <p>
                              <strong className="text-foreground font-heading">Tracking ID (Trackon):</strong>{' '}
                              {order.trackingId ? (
                                <span className="bg-green-50 text-green-700 px-2 py-0.5 border border-green-200 rounded font-bold">{order.trackingId}</span>
                              ) : (
                                <button
                                  onClick={() => {
                                    const tid = prompt('Enter Trackon Tracking ID:');
                                    if (tid) handleUpdateOrderStatus(order.id, undefined, tid);
                                  }}
                                  className="text-primary hover:underline font-bold"
                                >
                                  + Assign Tracking ID
                                </button>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Items Table / Customizations list */}
                      <div className="space-y-4">
                        <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">Purchased Items & Personalizations</h4>
                        
                        <div className="space-y-4">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="p-4 border border-border/50 rounded-xl bg-white flex flex-col md:flex-row gap-5 items-start">
                              {/* Product card */}
                              <div className="flex gap-3 md:w-1/3 shrink-0">
                                <div className="w-14 h-14 rounded-lg overflow-hidden border border-border/60 bg-[#F8F3EE] shrink-0">
                                  <img 
                                    src={item.product.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&q=80'} 
                                    alt={item.product.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="font-heading font-bold text-xs text-foreground leading-snug line-clamp-2">{item.product.name}</h5>
                                  <p className="text-[10px] text-muted-foreground font-body mt-1">Qty: {item.quantity}</p>
                                  <p className="text-[10px] text-primary font-bold">₹{Number(item.price).toLocaleString()}</p>
                                </div>
                              </div>

                              {/* Item Status dropdown */}
                              <div className="flex flex-col gap-1.5 md:w-1/4 shrink-0">
                                <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Product Status</label>
                                <select
                                  value={item.status || 'PENDING'}
                                  onChange={(e) => handleUpdateOrderItemStatus(item.id, e.target.value)}
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary ${
                                    item.status === 'COMPLETED' ? 'bg-green-50 border-green-200 text-green-700' :
                                    item.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                    'bg-gray-50 border-border text-muted-foreground'
                                  }`}
                                >
                                  <option value="PENDING">QUEUED (PENDING)</option>
                                  <option value="IN_PROGRESS">CRAFTING (IN_PROGRESS)</option>
                                  <option value="COMPLETED">READY (COMPLETED)</option>
                                </select>
                              </div>

                              {/* Asset preview */}
                              <div className="flex-1 min-w-0 w-full space-y-3 p-3 bg-secondary/10 rounded-xl border border-border/40">
                                <div className="flex flex-col gap-4 items-start">
                                  <div className="space-y-1.5 w-full">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">Uploaded Photos</span>
                                    <div className="grid gap-2 p-2 bg-white rounded-xl border border-border/10 overflow-y-auto max-h-40"
                                      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))' }}
                                    >
                                      {(() => {
                                        let imageUrls: string[] = [];
                                        if (item.customImage) {
                                          if (item.customImage.startsWith('[')) {
                                            try {
                                              imageUrls = JSON.parse(item.customImage);
                                            } catch {
                                              imageUrls = [item.customImage];
                                            }
                                          } else {
                                            imageUrls = [item.customImage];
                                          }
                                        }

                                        return imageUrls.length > 0 ? (
                                          imageUrls.map((url, uIdx) => (
                                            <div key={uIdx} className="w-full aspect-square rounded-lg overflow-hidden border border-border bg-white relative group">
                                              <img src={url} className="w-full h-full object-cover" alt="Custom upload" />
                                              <a
                                                href={url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                              >
                                                <ExternalLink size={12} />
                                              </a>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="col-span-full flex items-center justify-center h-14 rounded-lg border border-dashed border-border/80 text-muted-foreground/40 text-xs bg-white">
                                            No Images
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>

                                  <div className="flex-1">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">Personalization Note</span>
                                    <div className="mt-1 bg-white p-3 rounded-lg border border-border/40 text-xs leading-relaxed text-foreground/80 italic font-body min-h-[50px]">
                                      {item.customNote ? `"${item.customNote}"` : 'No customization instructions entered.'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Contacts View */}
          {activeTab === 'contacts' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">Custom Requests</h2>
                <p className="text-muted-foreground text-sm font-body mt-0.5">Messages from the contact form</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {data.contacts.map((c) => (
                  <div key={c.id} className="bg-white border border-border/60 rounded-xl p-5 shadow-card hover:border-primary/20 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock size={9} /> {new Date(c.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={`mailto:${c.email}`}
                          className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                          title="Reply via Email"
                        >
                          <MessageSquare size={16} />
                        </a>
                        <button
                          onClick={() => handleDeleteContact(c.id)}
                          className="text-muted-foreground hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete Message"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="bg-[#F8F3EE] rounded-lg p-3">
                      <p className="text-sm leading-relaxed text-foreground/75 whitespace-pre-wrap font-body">{c.message}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2.5 font-medium flex items-center gap-1 font-body">
                      <CheckCircle2 size={10} className="text-primary" /> {c.email}
                    </p>
                  </div>
                ))}
                {data.contacts.length === 0 && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 p-14 text-center text-muted-foreground bg-white rounded-xl border border-dashed border-border font-body">
                    <MessageSquare size={32} className="mx-auto mb-2 opacity-20" />
                    No messages received yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile View */}
          {activeTab === 'profile' && (
            <AdminProfile profile={data.profile} token={token!} onRefresh={fetchData} />
          )}
        </main>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowProductModal(false)} />
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-elevated z-10 overflow-hidden border border-border/60 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border/60 flex items-center justify-between bg-[#F8F3EE]">
              <h3 className="font-heading text-xl font-bold text-foreground">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 overflow-y-auto space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Name</label>
                  <input
                    required type="text"
                    className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="e.g. Couple Memory Frame"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price (₹)</label>
                  <input
                    required type="number"
                    className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                    onWheel={e => e.currentTarget.blur()}
                    placeholder="1499"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                  <select
                    required
                    className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm cursor-pointer"
                    value={newProduct.category}
                    onChange={e => {
                      const cat = e.target.value;
                      const subs = SUBCATEGORIES_MAP[cat] || [];
                      setNewProduct({
                        ...newProduct,
                        category: cat,
                        subCategory: subs.length > 0 ? subs[0] : ''
                      });
                    }}
                  >
                    <option value="" disabled>Select a category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {newProduct.category && SUBCATEGORIES_MAP[newProduct.category]?.length > 0 ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type / Sub-Category</label>
                    <select
                      className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm cursor-pointer"
                      value={newProduct.subCategory}
                      onChange={e => setNewProduct({...newProduct, subCategory: e.target.value})}
                    >
                      {SUBCATEGORIES_MAP[newProduct.category].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5 opacity-40">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type / Sub-Category</label>
                    <input
                      disabled
                      placeholder="No types for this category"
                      className="w-full p-3 rounded-lg border border-border bg-background outline-none font-body text-sm cursor-not-allowed"
                    />
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Occasion</label>
                  <select
                    className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm cursor-pointer"
                    value={newProduct.occasion}
                    onChange={e => setNewProduct({...newProduct, occasion: e.target.value})}
                  >
                    <option value="">All / Generic Occasion</option>
                    {OCCASIONS.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gift For</label>
                  <select
                    className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm cursor-pointer"
                    value={newProduct.giftFor}
                    onChange={e => setNewProduct({...newProduct, giftFor: e.target.value})}
                  >
                    <option value="">All / Unisex</option>
                    {GIFT_FOR_OPTIONS.map(gf => (
                      <option key={gf} value={gf}>{gf}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Size</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm"
                    value={newProduct.size}
                    onChange={e => setNewProduct({...newProduct, size: e.target.value})}
                    placeholder="e.g. 8x10 inches"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Tip: Use <code className="bg-secondary px-1 py-0.5 rounded font-mono font-bold">*</code> or <code className="bg-secondary px-1 py-0.5 rounded font-mono font-bold">x</code> (e.g., 8*10 or 8x10). It automatically displays as a premium <code className="bg-secondary px-1 py-0.5 rounded font-mono font-bold">8 × 10</code> on the website!
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Image</label>
                  <div className="flex rounded-lg border border-border overflow-hidden text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${
                        imageInputMode === 'upload' ? 'bg-primary text-white' : 'bg-background text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <Upload size={10} /> Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${
                        imageInputMode === 'url' ? 'bg-primary text-white' : 'bg-background text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <Link size={10} /> URL
                    </button>
                  </div>
                </div>

                {imageInputMode === 'upload' ? (
                  <div>
                    <label
                      className={`relative flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                        dragOver
                          ? 'border-primary bg-primary/5 scale-[1.01]'
                          : uploadingImage
                          ? 'border-primary/40 bg-primary/5 cursor-not-allowed'
                          : 'border-border hover:border-primary/50 hover:bg-[#F8F3EE]/60'
                      }`}
                      style={{ minHeight: newProduct.image ? '80px' : '120px' }}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleFileDrop}
                    >
                      {newProduct.image ? (
                        <div className="flex items-center gap-3 p-3 w-full">
                          <img
                            src={newProduct.image}
                            alt="Preview"
                            className="w-16 h-16 rounded-lg object-cover border border-border/60 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-green-600 flex items-center gap-1">
                              <CheckCircle2 size={12} /> Uploaded to Cloudinary
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{newProduct.image}</p>
                            {!uploadingImage && (
                              <p className="text-[10px] text-primary mt-1 font-medium">Click or drag to replace</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-6 px-4 text-center">
                          {uploadingImage ? (
                            <>
                              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                              <p className="text-xs font-medium text-primary">Uploading... {uploadProgress}%</p>
                            </>
                          ) : (
                            <>
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <ImageIcon size={20} className="text-primary" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-foreground">Drop image here or click to browse</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WEBP — Full quality, up to 20MB</p>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      {!uploadingImage && (
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                        />
                      )}
                    </label>
                    {uploadingImage && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                          <span>Uploading at full quality...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm"
                      value={newProduct.image}
                      onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                    {newProduct.image && (
                      <div className="flex items-center gap-3 bg-[#F8F3EE] rounded-lg p-2">
                        <img
                          src={newProduct.image}
                          alt="Preview"
                          className="w-12 h-12 rounded-lg object-cover border border-border/60 flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <p className="text-[10px] text-muted-foreground">Image preview</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea
                  rows={3}
                  className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 resize-none font-body text-sm"
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Describe this gift..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary"
                    checked={newProduct.featured}
                    onChange={e => setNewProduct({...newProduct, featured: e.target.checked})}
                  />
                  <span className="text-sm font-medium font-body text-foreground">Mark as Featured</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-red-500"
                    checked={newProduct.isSoldOut}
                    onChange={e => setNewProduct({...newProduct, isSoldOut: e.target.checked})}
                  />
                  <span className="text-sm font-medium font-body text-foreground">Sold Out</span>
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-3 px-4 border border-border rounded-lg font-medium font-body hover:bg-secondary transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-medium font-body hover:bg-primary/90 shadow-soft text-sm"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const NavItems = ({
  activeTab,
  setActiveTab,
  counts,
  collapsed = false
}: {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  counts: { products: number; orders: number; contacts: number };
  collapsed?: boolean;
}) => (
  <>
    {!collapsed && <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 pb-1">Navigation</p>}
    {[
      { id: 'products', label: 'Products', icon: Package, count: counts.products },
      { id: 'orders', label: 'Orders', icon: ShoppingBag, count: counts.orders },
      { id: 'contacts', label: 'Messages', icon: MessageSquare, count: counts.contacts },
    ].map(item => (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        id={`nav-${item.id}`}
        title={collapsed ? item.label : undefined}
        className={`flex items-center rounded-lg transition-all w-full ${
          collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5 text-left'
        } ${
          activeTab === item.id
            ? 'bg-primary text-white shadow-soft'
            : 'hover:bg-[#F8F3EE] text-foreground/70'
        }`}
      >
        <div className={`flex items-center ${ collapsed ? '' : 'gap-2.5' }`}>
          <item.icon size={18} />
          {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
        </div>
        {!collapsed && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            activeTab === item.id ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'
          }`}>
            {item.count !== undefined ? item.count : ''}
          </span>
        )}
      </button>
    ))}
    
    <div className={collapsed ? 'mt-2' : 'mt-6'}>
      {!collapsed && <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 pb-1">Settings</p>}
      <button
        onClick={() => setActiveTab('profile')}
        title={collapsed ? 'My Profile' : undefined}
        className={`flex items-center rounded-lg transition-all w-full ${
          collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5 text-left'
        } ${
          activeTab === 'profile'
            ? 'bg-primary text-white shadow-soft'
            : 'hover:bg-[#F8F3EE] text-foreground/70'
        }`}
      >
        <User size={18} />
        {!collapsed && <span className="font-medium text-sm">My Profile</span>}
      </button>
    </div>
  </>
);

const AdminProfile = ({ profile, token, onRefresh }: { profile: any; token: string; onRefresh: () => void }) => {
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    email: profile?.email || '',
    currentPassword: '',
    newPassword: ''
  });
  const [image, setImage] = useState(profile?.profileImage || '');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({ ...prev, username: profile.username || '', email: profile.email || '' }));
      setImage(profile.profileImage || '');
    }
  }, [profile]);

  // Cropping State
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropping, setIsCropping] = useState(false);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
  }

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImgSrc(reader.result?.toString() || '');
      setIsCropping(true);
    });
    reader.readAsDataURL(file);
  };

  const uploadCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) return;

    setUploadingImage(true);
    setIsCropping(false);

    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('No 2d context');

      const pixelRatio = window.devicePixelRatio;
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9);
      });

      const payload = new FormData();
      payload.append('file', blob);
      payload.append('upload_preset', 'n1cagrkp');

      const res = await fetch(`https://api.cloudinary.com/v1_1/dh0y5gfiu/image/upload`, {
        method: 'POST',
        body: payload
      });
      const result = await res.json();
      if (result.secure_url) {
        setImage(result.secure_url);
        toast.success("Profile photo adjusted!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (e) {
      toast.error("Failed to process image.");
    } finally {
      setUploadingImage(false);
      setImgSrc('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { username: formData.username, email: formData.email, profileImage: image };
      if (formData.newPassword) {
        payload.newPassword = formData.newPassword;
        payload.currentPassword = formData.currentPassword;
      }
      
      await api.updateAdminProfile(token, payload);
      toast.success("Profile updated successfully!");
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 w-full">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">My Profile</h2>
        <p className="text-muted-foreground text-sm font-body mt-0.5">Manage your account settings and security</p>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-border/60 p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center border-b border-border/60 pb-6">
            <div 
              className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#F8F3EE] bg-secondary flex items-center justify-center group flex-shrink-0"
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              {image ? (
                <img src={image} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <User size={40} className="text-muted-foreground" />
              )}
              <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload size={18} className="text-white mb-1" />
                <span className="text-[10px] text-white font-bold">Change</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file);
                      e.target.value = ''; // Reset input so the same file can be selected again
                    }
                  }}
                  disabled={uploadingImage}
                />
              </label>
              {uploadingImage && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Package className="animate-spin text-primary" size={20} />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-foreground">Profile Picture</h3>
              <p className="text-xs text-muted-foreground font-body">PNG, JPG or JPEG. Recommended size 400x400px.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Username</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none font-body text-sm transition-all"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
              <input
                type="email"
                className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none font-body text-sm transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="border-t border-border/60 pt-6">
            <h3 className="font-heading font-bold text-lg text-foreground mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="space-y-1.5 max-w-sm">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Password</label>
                <input
                  type="password"
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none font-body text-sm transition-all"
                  value={formData.currentPassword}
                  onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                  placeholder="Verify password to save changes"
                  required
                />
              </div>
              <div className="space-y-1.5 max-w-sm pt-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password (Optional)</label>
                <input
                  type="password"
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none font-body text-sm transition-all"
                  value={formData.newPassword}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                  placeholder="Leave empty to keep current"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="py-3 px-6 bg-primary text-white rounded-lg font-medium font-body hover:bg-primary/90 shadow-soft text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Cropping Modal */}
      {isCropping && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-foreground/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-elevated animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-[#F8F3EE]">
              <h3 className="font-heading font-bold text-lg text-foreground">Adjust Profile Picture</h3>
              <button onClick={() => setIsCropping(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[70vh] flex flex-col items-center gap-4 bg-white">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                className="max-w-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-h-[50vh] object-contain"
                />
              </ReactCrop>
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-body">Drag to adjust the circular area</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border/60 flex gap-3 bg-[#F8F3EE]">
              <button
                onClick={() => setIsCropping(false)}
                className="flex-1 py-3 px-4 border border-border rounded-lg font-medium font-body hover:bg-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={uploadCroppedImage}
                className="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-medium font-body hover:bg-primary/90 shadow-soft text-sm transition-colors"
              >
                Apply & Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
