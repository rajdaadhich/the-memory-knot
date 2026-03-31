import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategoriesSection from '@/components/CategoriesSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import WhyChooseUs from '@/components/WhyChooseUs';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import GallerySection from '@/components/GallerySection';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { CartProvider } from '@/contexts/CartContext';

const Index = () => {
  return (
    <CartProvider>
      <div className="min-h-screen">
        <Navbar />
        <HeroSection />
        <CategoriesSection />
        <FeaturedProducts />
        <WhyChooseUs />
        <HowItWorks />
        <Testimonials />
        <GallerySection />
        <ContactForm />
        <Footer />
        <CartDrawer />
        <WhatsAppButton />
      </div>
    </CartProvider>
  );
};

export default Index;
