import React from 'react';
import { FeatureProps } from './types';

const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-8 transition-all duration-300 hover:-translate-y-1">
      <div className="text-4xl mb-6 text-primary">{icon}</div>
      <h3 className="text-xl font-semibold mb-3 text-contrast">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-contrast">Why Choose SoraGo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          <Feature 
            icon="🚗"
            title="Flexible Plans"
            description="Choose from daily, weekly, monthly, or yearly subscriptions that adapt to your needs."
          />
          <Feature 
            icon="💰"
            title="Cost Effective"
            description="No maintenance costs, insurance included, and transparent pricing with no hidden fees."
          />
          <Feature 
            icon="⚡"
            title="Quick & Easy"
            description="Select your car, choose your plan, and get on the road in less than 24 hours."
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
