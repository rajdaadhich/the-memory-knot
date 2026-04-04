import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
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
  TrendingUp
} from 'lucide-react';
import { SITE_CONFIG } from '@/config';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'contacts'>('products');
  const [data, setData] = useState<{ products: any[], orders: any[], contacts: any[] }>({
    products: [],
    orders: [],
    contacts: []
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
    featured: false
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [products, orders, contacts] = await Promise.all([
        api.getProducts(),
        api.getAdminOrders(token!),
        api.getAdminContacts(token!)
      ]);
      setData({ products, orders, contacts });
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
      setNewProduct({ name: '', price: '', description: '', image: '', category: '', featured: false });
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

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      await api.updateAdminOrder(token!, id, status);
      toast.success(`Order status updated to ${status}`);
      fetchData();
    } catch {
      toast.error('Failed to update order status');
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

  return (
    <div className="min-h-screen bg-[#F8F3EE] flex flex-col">
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

        <button
          onClick={handleLogout}
          id="admin-logout"
          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-xs md:text-sm font-medium text-foreground/70 hover:text-primary border border-border/60"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Logout</span>
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
        <aside className="w-60 bg-white border-r border-border/60 p-4 hidden lg:flex flex-col gap-2 h-full sticky top-[61px]" style={{ height: 'calc(100vh - 61px)' }}>
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
          <NavItems
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            counts={{ products: data.products.length, orders: data.orders.length, contacts: data.contacts.length }}
          />
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-5 lg:p-8 max-w-6xl w-full">
          {/* Products View */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-foreground">Manage Products</h2>
                  <p className="text-muted-foreground text-sm font-body mt-0.5">Add, edit, or remove gift products</p>
                </div>
                <button
                  id="add-product-btn"
                  onClick={() => {
                    setEditingProduct(null);
                    setNewProduct({ name: '', price: '', description: '', image: '', category: '', featured: false });
                    setShowProductModal(true);
                  }}
                  className="bg-primary text-white px-4 py-2.5 rounded-lg font-medium font-body flex items-center gap-2 hover:bg-primary/90 shadow-soft text-sm"
                >
                  <Plus size={16} />
                  Add Product
                </button>
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
                          {p.featured ? (
                            <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase">Featured</span>
                          ) : (
                            <span className="px-2.5 py-1 bg-secondary text-muted-foreground text-[10px] font-bold rounded-full uppercase">Standard</span>
                          )}
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
                                  featured: p.featured
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
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">Recent Orders</h2>
                <p className="text-muted-foreground text-sm font-body mt-0.5">Review and manage your gift orders</p>
              </div>

              <div className="space-y-4">
                {data.orders.map((order) => (
                  <div key={order.id} className="bg-white border border-border/60 rounded-xl p-5 shadow-card hover:border-primary/20 transition-all">
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
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Amount</p>
                          <p className="text-primary font-bold text-lg">₹{Number(order.totalAmount).toLocaleString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          order.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {order.status}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'APPROVED')}
                              className="px-3 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-bold hover:bg-blue-600 transition-colors uppercase tracking-wide"
                            >
                              Approve
                            </button>
                          )}
                          {order.status === 'APPROVED' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                              className="px-3 py-1 rounded-lg bg-green-500 text-white text-[10px] font-bold hover:bg-green-600 transition-colors uppercase tracking-wide"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                          <User size={11} /> Customer
                        </p>
                        <p className="text-sm font-medium text-foreground">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Phone size={11} /> {order.customerPhone}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                          <MapPin size={11} /> Delivery
                        </p>
                        <p className="text-sm text-foreground leading-tight">{order.address}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                          <Package size={11} /> Items
                        </p>
                        <div className="space-y-1">
                          {order.items.map((item: any) => (
                            <p key={item.id} className="text-sm text-foreground">• {item.product.name} (×{item.quantity})</p>
                          ))}
                        </div>
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
            </div>
          )}

          {/* Contacts View */}
          {activeTab === 'contacts' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">Custom Requests</h2>
                <p className="text-muted-foreground text-sm font-body mt-0.5">Messages from the contact form</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                      <a
                        href={`mailto:${c.email}`}
                        className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                        title="Reply via Email"
                      >
                        <MessageSquare size={16} />
                      </a>
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
                  <div className="col-span-2 p-14 text-center text-muted-foreground bg-white rounded-xl border border-dashed border-border font-body">
                    <MessageSquare size={32} className="mx-auto mb-2 opacity-20" />
                    No messages received yet.
                  </div>
                )}
              </div>
            </div>
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
                    placeholder="1499"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  placeholder="e.g. Couples, Family, Friends"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image URL</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm"
                  value={newProduct.image}
                  onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                  placeholder="https://... or leave empty for default"
                />
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

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  checked={newProduct.featured}
                  onChange={e => setNewProduct({...newProduct, featured: e.target.checked})}
                />
                <span className="text-sm font-medium font-body text-foreground">Mark as Featured</span>
              </label>

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
  counts
}: {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  counts: { products: number; orders: number; contacts: number };
}) => (
  <>
    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 pb-1">Navigation</p>
    {[
      { id: 'products', label: 'Products', icon: Package, count: counts.products },
      { id: 'orders', label: 'Orders', icon: ShoppingBag, count: counts.orders },
      { id: 'contacts', label: 'Messages', icon: MessageSquare, count: counts.contacts },
    ].map(item => (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        id={`nav-${item.id}`}
        className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all w-full text-left ${
          activeTab === item.id
            ? 'bg-primary text-white shadow-soft'
            : 'hover:bg-[#F8F3EE] text-foreground/70'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <item.icon size={18} />
          <span className="font-medium text-sm">{item.label}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          activeTab === item.id ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'
        }`}>
          {item.count}
        </span>
      </button>
    ))}
  </>
);

export default AdminDashboard;
