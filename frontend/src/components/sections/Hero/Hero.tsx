import React from 'react';
import Link from 'next/link';

const Hero: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-primary to-blue-700 pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
      {/* Abstract shapes in background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-white"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white"></div>
        <div className="absolute top-40 right-20 w-20 h-20 rounded-full bg-white"></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
          Drive <span className="text-accent">Your Way</span>
        </h1>
        <p className="text-xl mb-10 max-w-xl mx-auto text-white opacity-90">
          Flexible car subscriptions tailored to your lifestyle.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="#plans" 
            className="bg-white text-primary font-semibold px-8 py-3 rounded-md transition-all duration-300 hover:bg-opacity-90 hover:-translate-y-1"
          >
            View Plans
          </Link>
          <Link 
            href="#about" 
            className="bg-transparent border border-white text-white font-semibold px-8 py-3 rounded-md transition-all duration-300 hover:bg-white hover:bg-opacity-10 hover:-translate-y-1"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
