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
import { Helmet } from 'react-helmet-async';

import { SITE_CONFIG } from '@/config';

const Index = () => {
  return (
    <CartProvider>
      <Helmet>
        <title>{SITE_CONFIG.name} | Personalized Gifts & Handcrafted Treasures</title>
        <meta name="description" content={`Preserve your most precious memories with ${SITE_CONFIG.name}. We create beautiful, handcrafted personalized gifts for every occasion. Shop now!`} />
        <meta name="keywords" content="handmade gifts, personalized gifts, custom resin art, photo memory gifts, unique craft items" />
        <meta property="og:title" content={`${SITE_CONFIG.name} | Handcrafted Memories`} />
        <meta property="og:description" content="Beautiful handcrafted personalized gifts to preserve your memories forever." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
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
