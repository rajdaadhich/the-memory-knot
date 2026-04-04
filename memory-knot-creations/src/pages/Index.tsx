import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import BestSellers from '@/components/BestSellers';
import Testimonials from '@/components/Testimonials';
import InstagramSection from '@/components/InstagramSection';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/config';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>{SITE_CONFIG.name} | {SITE_CONFIG.tagline}</title>
        <meta name="description" content={`${SITE_CONFIG.name} — Personalized handcrafted gifts for couples, families & friends. Custom photo frames, memory boxes, anniversary gifts & more.`} />
        <meta name="keywords" content="personalized gifts, handmade gifts, custom photo frames, memory gifts, anniversary gifts, couple gifts, India" />
        <meta property="og:title" content={`${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`} />
        <meta property="og:description" content="Beautiful personalized handcrafted gifts to preserve your memories forever." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-[#F8F3EE]">
        <Navbar />
        <HeroSection />
        <BestSellers />
        <Testimonials />
        <InstagramSection />
        <Footer />
        <CartDrawer />
        <WhatsAppButton />
      </div>
    </>
  );
};

export default Index;
