import React from 'react';
import Link from 'next/link';

const CTA: React.FC = () => {
  return (
    <section className="bg-primary py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p className="text-white text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          Choose your plan today and experience the freedom of SoraGo.
        </p>
        <Link 
          href="#plans" 
          className="bg-accent hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-full inline-block transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
        >
          Choose Your Plan
        </Link>
      </div>
    </section>
  );
};

export default CTA;
