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
  ChevronRight,
  Clock,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';


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

  // Product Actions
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
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteAdminProduct(token!, id);
      toast.success('Product deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      await api.updateAdminOrder(token!, id, status);
      toast.success(`Order status updated to ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Package size={18} />
            </div>
            <h1 className="font-heading font-bold text-lg md:text-xl">MK Admin</h1>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-xs md:text-sm font-medium"
        >
          <LogOut size={16} />
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
            className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border p-4 shadow-elevated flex flex-col gap-2 animate-in slide-in-from-left duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 px-2">
              <span className="font-heading font-bold text-lg">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <NavItems 
              activeTab={activeTab} 
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }} 
            />
          </aside>
        </div>
      )}


      <div className="flex flex-1">
        {/* Sidebar (Desktop) */}
        <aside className="w-64 bg-card border-r border-border p-4 hidden lg:flex flex-col gap-2">
          <NavItems activeTab={activeTab} setActiveTab={setActiveTab} />
        </aside>


        {/* Content Area */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {/* Products View */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-heading">Manage Products</h2>
                  <p className="text-muted-foreground text-sm">Add or edit your collection gifts</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingProduct(null);
                    setNewProduct({ name: '', price: '', description: '', image: '', category: '', featured: false });
                    setShowProductModal(true);
                  }}
                  className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:opacity-90 shadow-soft"
                >
                  <Plus size={18} />
                  Add Product
                </button>
              </div>

              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-secondary/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4">Image</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.products.map((p) => (
                      <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4">
                          <img src={p.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&q=80'} className="w-12 h-12 rounded-lg object-cover" />
                        </td>
                        <td className="px-6 py-4 font-medium text-sm">{p.name}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-primary">₹{p.price}</td>
                        <td className="px-6 py-4">
                          {p.featured ? (
                            <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase">Featured</span>
                          ) : (
                            <span className="px-2 py-1 bg-secondary text-muted-foreground text-[10px] font-bold rounded-full uppercase">Standard</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
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
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(p.id)}
                              className="w-8 h-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {data.products.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          No products found. Start by adding one!
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
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-heading">Recent Orders</h2>
                <p className="text-muted-foreground text-sm">Review your custom gift orders</p>
              </div>

              <div className="space-y-4">
                {data.orders.map((order) => (
                  <div key={order.id} className="bg-card border border-border rounded-2xl p-6 shadow-soft group hover:border-primary/30 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <ShoppingBag size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Order #{order.id.slice(0, 8)}</p>
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Clock size={12} />
                            {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Amount</p>
                          <p className="text-primary font-bold">₹{order.totalAmount}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                          order.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {order.status}
                        </span>
                        
                        <div className="flex items-center gap-1.5 ml-2">
                          {order.status === 'PENDING' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'APPROVED')}
                              className="px-2.5 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-bold hover:bg-blue-600 transition-colors shadow-soft uppercase tracking-wider"
                            >
                              Approve
                            </button>
                          )}
                          {order.status === 'APPROVED' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                              className="px-2.5 py-1 rounded-lg bg-green-500 text-white text-[10px] font-bold hover:bg-green-600 transition-colors shadow-soft uppercase tracking-wider"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-border">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                          <User size={12} /> Customer
                        </p>
                        <p className="text-sm font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                          <Phone size={12} /> {order.customerPhone}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                          <MapPin size={12} /> Delivery Address
                        </p>
                        <p className="text-sm text-balance leading-tight">{order.address}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                          <Package size={12} /> Items
                        </p>
                        <div className="max-h-24 overflow-y-auto pr-2 space-y-1">
                          {order.items.map((item: any) => (
                            <p key={item.id} className="text-sm">
                              • {item.product.name} (x{item.quantity})
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {data.orders.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
                    No orders placed yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contacts View */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-heading">Custom Requests</h2>
                <p className="text-muted-foreground text-sm">Messages from the contact form</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {data.contacts.map((c) => (
                  <div key={c.id} className="bg-card border border-border rounded-2xl p-6 shadow-soft flex flex-col h-full hover:border-primary/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-semibold">
                            <Clock size={10} /> {new Date(c.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <a href={`mailto:${c.email}`} className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors">
                        <MessageSquare size={18} />
                      </a>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-4 flex-1">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.message}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 font-medium flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-primary" /> From {c.email}
                    </p>
                  </div>
                ))}
                {data.contacts.length === 0 && (
                  <div className="col-span-2 p-12 text-center text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
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
          <div className="bg-card w-full max-w-xl rounded-2xl shadow-elevated z-10 overflow-hidden border border-border flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex items-center justify-between bg-card sticky top-0">
              <h3 className="text-xl font-bold font-heading">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button 
                onClick={() => setShowProductModal(false)}
                className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
              >
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Name</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full p-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price (₹)</label>
                  <input 
                    required 
                    type="number" 
                    className="w-full p-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image URL (Unsplash or direct link)</label>
                <input 
                  type="text" 
                  className="w-full p-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20"
                  value={newProduct.image}
                  onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                  placeholder="Leave empty for default"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea 
                  rows={3}
                  className="w-full p-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 accent-primary"
                    checked={newProduct.featured}
                    onChange={e => setNewProduct({...newProduct, featured: e.target.checked})}
                  />
                  <span className="text-sm font-medium">Show as Featured</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-3 px-4 border border-border rounded-xl font-medium hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 shadow-soft"
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

const NavItems = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: any) => void }) => (
  <>
    <button 
      onClick={() => setActiveTab('products')}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-primary text-primary-foreground shadow-soft' : 'hover:bg-secondary'}`}
    >
      <Package size={20} />
      <span className="font-medium">Products</span>
    </button>
    <button 
      onClick={() => setActiveTab('orders')}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-primary text-primary-foreground shadow-soft' : 'hover:bg-secondary'}`}
    >
      <ShoppingBag size={20} />
      <span className="font-medium">Orders</span>
    </button>
    <button 
      onClick={() => setActiveTab('contacts')}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'contacts' ? 'bg-primary text-primary-foreground shadow-soft' : 'hover:bg-secondary'}`}
    >
      <MessageSquare size={20} />
      <span className="font-medium">Messages</span>
    </button>
  </>
);

export default AdminDashboard;

