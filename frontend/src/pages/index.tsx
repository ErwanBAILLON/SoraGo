import React from 'react';
import { NextPage } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Hero, 
  Features, 
  Plans, 
  Testimonials, 
  CTA 
} from '@/components/sections';

/**
 * SoraGo Home Page
 */
const Home: NextPage = () => {
  return (
    <MainLayout>
      {/* Hero Banner */}
      <Hero />
      
      {/* About Section */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
              About SoraGo
            </h2>
            <p className="text-center text-muted-foreground text-lg leading-relaxed">
              SoraGo provides flexible car subscriptions for the modern world. We offer a range of plans 
              tailored to your mobility needs, whether you&apos;re a city dweller who needs occasional access 
              to a car or a frequent traveler requiring reliable transportation. Our service eliminates 
              the hassle of car ownership while giving you all the freedom.
            </p>
          </div>
        </div>
      </section>
      
      {/* Key Features */}
      <Features />
      
      {/* Subscription Plans */}
      <Plans />
      
      {/* Customer Testimonials */}
      <Testimonials />
      
      {/* Call to Action */}
      <CTA />
    </MainLayout>
  );
};

export default Home;
