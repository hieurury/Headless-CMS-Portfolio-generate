import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUIStore } from '../../store/uiStore';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { CommunitySection } from './components/CommunitySection';
import { Footer } from './components/Footer';
import { useSeo } from '../../hooks/useSeo';
import './home.css';

gsap.registerPlugin(ScrollTrigger);

export const HomePage: React.FC = () => {
  const { theme } = useUIStore();

  useSeo({
    title: 'Ruryfo CMS — Nền tảng tạo Portfolio cá nhân tự động',
    description: 'Ruryfo CMS là nền tảng Headless CMS giúp bạn xây dựng và chia sẻ portfolio cá nhân một cách tự động, nhanh chóng và đẹp mắt.',
  });

  // Removed scroll snapping to fix scroll trapping issue
  // Init ScrollTrigger refresh on mount
  useEffect(() => {
    ScrollTrigger.refresh();
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="home-page" id="home-page" data-theme={theme}>
      <Navbar />
      <main id="home-main">
        <HeroSection />
        <FeaturesSection />
        <CommunitySection />
      </main>
      <Footer />
    </div>
  );
};
