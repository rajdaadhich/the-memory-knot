import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { Upload, FileText, CheckCircle2, ArrowRight, Loader2, Image as ImageIcon, Heart, Trash2, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_CONFIG } from '@/config';

const CLOUDINARY_CLOUD_NAME = 'dh0y5gfiu';
const CLOUDINARY_UPLOAD_PRESET = 'n1cagrkp';

interface CustomizationItem {
  itemId: string;
  productName: string;
  productImage: string;
  customImages: string[];
  customNote: string;
  uploading: boolean;
  progress: number;
}

// Helper to optimize and compress large images client-side before upload
const optimizeImage = (file: File): Promise<Blob | File> => {
  return new Promise((resolve) => {
    // Only optimize image files larger than 1.5 MB
    if (!file.type.startsWith('image/') || file.size < 1.5 * 1024 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      const maxDim = 2500; // 2500px is more than enough for high-res gifting prints
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
        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, { type: 'image/jpeg' });
            resolve(optimizedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.92); // 92% quality JPEG reduces file size by 90% without loss of detail
      } else {
        resolve(file);
      }
    };
    img.onerror = () => resolve(file);
  });
};

const CustomizationPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [orderItems, setOrderItems] = useState<CustomizationItem[]>([]);
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    if (!orderId) {
      navigate('/orders');
      return;
    }

    const fetchOrder = async () => {
      try {
        const order = await api.getOrderDetails(orderId);
        setCustomerName(order.customerName);
        
        // Check if any item in the order already has customizations submitted
        const hasPrev = order.items.some((item: any) => item.customImage || item.customNote);
        setAlreadySubmitted(hasPrev);

        // Map order items into state and parse legacy/json list of custom images
        const items = order.items.map((item: any) => {
          let urls: string[] = [];
          if (item.customImage) {
            if (item.customImage.startsWith('[')) {
              try {
                urls = JSON.parse(item.customImage);
              } catch {
                urls = [item.customImage];
              }
            } else {
              urls = [item.customImage];
            }
          }
          return {
            itemId: item.id,
            productName: item.product.name,
            productImage: item.product.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80',
            customImages: urls,
            customNote: item.customNote || '',
            uploading: false,
            progress: 0
          };
        });
        
        setOrderItems(items);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load order details');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const handleFilesUpload = async (index: number, files: FileList) => {
    if (alreadySubmitted) return;
    if (!files || files.length === 0) return;

    // Set uploading state for specific item
    setOrderItems(prev => prev.map((item, idx) => 
      idx === index ? { ...item, uploading: true, progress: 0 } : item
    ));

    const totalFiles = files.length;
    let uploadedUrls: string[] = [];
    let progressMap: Record<number, number> = {};

    // Trigger all file optimization & upload processes in parallel
    const uploadPromises = Array.from(files).map(async (file, fileIdx) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" is not an image file`);
        return;
      }

      // Optimize large photos client-side (reduces size from 12MB -> 400KB in milliseconds)
      const optimizedFile = await optimizeImage(file);

      try {
        const formData = new FormData();
        formData.append('file', optimizedFile);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('quality', 'auto:best');

        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const currentFilePct = Math.round((e.loaded / e.total) * 100);
            progressMap[fileIdx] = currentFilePct;
            
            // Calculate aggregated progress across all parallel file uploads
            const totalProgressSum = Object.values(progressMap).reduce((sum, val) => sum + val, 0);
            const overallPct = Math.round(totalProgressSum / totalFiles);
            
            setOrderItems(prev => prev.map((item, idx) => 
              idx === index ? { ...item, progress: Math.min(overallPct, 99) } : item
            ));
          }
        };

        const secureUrl = await new Promise<string>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status === 200) {
              const res = JSON.parse(xhr.responseText);
              resolve(res.secure_url);
            } else {
              reject(new Error('Cloudinary upload failed'));
            }
          };
          xhr.onerror = () => reject(new Error('Network error during upload'));
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
          xhr.send(formData);
        });

        uploadedUrls.push(secureUrl);
        progressMap[fileIdx] = 100;

        // Append the uploaded URL incrementally
        setOrderItems(prev => prev.map((item, idx) => 
          idx === index ? { ...item, customImages: [...item.customImages, secureUrl] } : item
        ));

      } catch (err) {
        console.error(err);
        toast.error(`Failed to upload: ${file.name}`);
      }
    });

    await Promise.all(uploadPromises);

    setOrderItems(prev => prev.map((item, idx) => 
      idx === index ? { ...item, uploading: false, progress: 100 } : item
    ));

    toast.success(`Batch upload of ${totalFiles} images completed!`);
  };

  const handleRemoveImage = (itemIndex: number, imageIndex: number) => {
    if (alreadySubmitted) return;
    setOrderItems(prev => prev.map((item, idx) => {
      if (idx === itemIndex) {
        const filteredImages = item.customImages.filter((_, i) => i !== imageIndex);
        return { ...item, customImages: filteredImages };
      }
      return item;
    }));
    toast.success('Image removed');
  };

  const handleNoteChange = (index: number, val: string) => {
    if (alreadySubmitted) return;
    setOrderItems(prev => prev.map((item, idx) => 
      idx === index ? { ...item, customNote: val } : item
    ));
  };

  const handleSubmit = async () => {
    if (!orderId || alreadySubmitted) return;

    setSubmitting(true);
    try {
      const payload = orderItems.map(item => ({
        itemId: item.itemId,
        customImage: JSON.stringify(item.customImages), // Store all image URLs as a JSON array string
        customNote: item.customNote
      }));

      await api.submitCustomization(orderId, payload);
      toast.success('Personalization details submitted successfully!');
      navigate('/orders');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save customization details');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F3EE] flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p className="text-muted-foreground font-body text-sm">Loading order items...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Personalize Your Order | {SITE_CONFIG.name}</title>
      </Helmet>

      <div className="min-h-screen bg-[#F8F3EE] flex flex-col justify-between">
        <Navbar />

        <main className="max-w-4xl mx-auto w-full px-4 lg:px-8 py-12 flex-1">
          {/* Header */}
          <div className="mb-10 text-center md:text-left">
            <h1 className="font-heading text-4xl font-black text-foreground">Personalize Your Order</h1>
            <p className="text-muted-foreground font-body text-sm mt-2">
              Hi <strong className="text-foreground">{customerName}</strong>, please upload the photographs and specific personalization requirements for the items in your order.
            </p>
          </div>

          {/* Already Submitted Banner Notice */}
          {alreadySubmitted && (
            <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 font-body leading-relaxed flex items-center gap-3">
              <span className="text-lg">🔒</span>
              <p>
                <strong>Personalization locked:</strong> Custom files and instructions for this order have already been sent to crafting. You can review the details below in read-only mode.
              </p>
            </div>
          )}

          {/* Items Customization Grid */}
          <div className="space-y-8">
            {orderItems.map((item, index) => (
              <div key={item.itemId} className="bg-white rounded-3xl p-6 shadow-sm border border-border/60 flex flex-col md:flex-row gap-6 relative overflow-hidden">
                {/* Product Info Block */}
                <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-border/60 pb-6 md:pb-0 md:pr-6">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border border-border shadow-sm mb-4">
                    <img 
                      src={item.productImage} 
                      alt={item.productName} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80';
                      }}
                    />
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground leading-snug">{item.productName}</h3>
                </div>

                {/* Upload & Personalization Input Block */}
                <div className="flex-1 space-y-5">
                  {/* Photo Upload slot */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Upload Photos for this Item (No Limits - Upload Up to 100+ images)
                    </label>
                    
                    {/* Render Uploaded Grid */}
                    {item.customImages.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-3 bg-secondary/10 rounded-2xl border border-border max-h-48 overflow-y-auto">
                        {item.customImages.map((url, imgIdx) => (
                          <div key={imgIdx} className="aspect-square rounded-xl overflow-hidden border border-border shadow-sm relative group bg-white">
                            <img src={url} className="w-full h-full object-cover" alt="Uploaded asset" />
                            {!alreadySubmitted && (
                              <button
                                onClick={() => handleRemoveImage(index, imgIdx)}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white rounded-xl"
                              >
                                <Trash2 size={14} className="text-red-300 hover:text-red-100" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Drag and Drop Zone */}
                    {!alreadySubmitted && (
                      <div className="relative group">
                        <div className="border-2 border-dashed border-border/80 group-hover:border-primary/40 rounded-2xl p-6 bg-secondary/5 flex flex-col items-center justify-center transition-all cursor-pointer">
                          {item.uploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="animate-spin text-primary" size={24} />
                              <span className="text-xs font-semibold text-primary font-body">Uploading batch... {item.progress}%</span>
                              <div className="w-48 h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${item.progress}%` }} />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-center">
                              <Upload size={24} className="text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                              <span className="text-xs font-bold text-foreground font-heading">Choose or Drag & Drop Multiple Photos</span>
                              <span className="text-[10px] text-muted-foreground font-body mt-1">Select multiple images at once (JPEG, PNG under 20MB)</span>
                            </div>
                          )}
                        </div>
                        {!item.uploading && (
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files) handleFilesUpload(index, files);
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Personalization text input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Personalization Instructions</label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={item.customNote}
                        onChange={(e) => handleNoteChange(index, e.target.value)}
                        readOnly={alreadySubmitted}
                        placeholder={alreadySubmitted ? "No special instructions provided." : "E.g., Please print 'Happy Birthday Mom!' in cursive, or use pastel ribbons."}
                        className={`w-full px-4 py-3 rounded-2xl border border-border focus:ring-primary/20 focus:ring-2 outline-none text-xs font-body shadow-sm resize-none bg-white placeholder-muted-foreground/60 focus:border-primary/40 transition-all ${
                          alreadySubmitted ? 'bg-secondary/5 text-muted-foreground border-dashed' : ''
                        }`}
                      />
                      <FileText size={14} className="absolute right-4 bottom-4 text-muted-foreground/40 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Action Bar / Locked Banner */}
          {alreadySubmitted ? (
            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-amber-50 rounded-3xl border border-amber-200 shadow-sm">
              <div className="text-center md:text-left">
                <h4 className="font-heading font-bold text-sm text-amber-800">Customizations Submitted</h4>
                <p className="text-[11px] text-amber-700 font-body mt-1">Your personalization choices have been saved and locked. If you need urgent corrections, please contact support.</p>
              </div>
              <button
                onClick={() => navigate('/orders')}
                className="w-full md:w-auto px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold font-heading text-xs uppercase tracking-wider transition-all"
              >
                Back to My Orders
              </button>
            </div>
          ) : (
            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white rounded-3xl border border-border/60 shadow-sm">
              <div className="text-center md:text-left">
                <h4 className="font-heading font-bold text-sm text-foreground">All Customizations Complete?</h4>
                <p className="text-[11px] text-muted-foreground font-body mt-1">Note: Once submitted, the custom files and instructions will be locked for crafting.</p>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold font-heading shadow-soft flex items-center justify-center gap-2 hover:bg-primary/95 transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Saving Details...
                  </>
                ) : (
                  <>
                    Submit Customizations <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CustomizationPage;
