import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUIStore } from '../../store/uiStore';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { CommunitySection } from './components/CommunitySection';
import { Footer } from './components/Footer';
import './home.css';

gsap.registerPlugin(ScrollTrigger);

export const HomePage: React.FC = () => {
  const { theme } = useUIStore();

  // Enable scroll snapping on HomePage
  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollSnapType = 'y mandatory';
    
    return () => {
      root.style.scrollSnapType = '';
    };
  }, []);

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
