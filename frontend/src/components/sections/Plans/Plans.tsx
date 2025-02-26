import React from 'react';
import PlanCard from './PlanCard';

const Plans: React.FC = () => {
  return (
    <section id="plans" className="py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-contrast">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 shadow-lg">
          <PlanCard 
            title="Basic Plan" 
            description="Perfect for occasional drivers" 
            price="€199/month"
            features={[
              'Access to economy cars',
              '500 km per month included',
              'Basic insurance coverage',
              'City parking included',
              '24/7 roadside assistance'
            ]}
          />
          
          <PlanCard 
            title="Standard Plan" 
            description="Ideal for regular drivers" 
            price="€299/month"
            features={[
              'Access to mid-range cars',
              '1000 km per month included',
              'Comprehensive insurance',
              'City parking included',
              'Car swaps once per month',
              '24/7 premium roadside assistance'
            ]}
            isPopular={true}
          />
          
          <PlanCard 
            title="Premium Plan" 
            description="For the frequent driver" 
            price="€399/month"
            features={[
              'Access to luxury vehicles',
              'Unlimited kilometers',
              'Full coverage insurance',
              'Nationwide parking access',
              'Car swaps twice per month',
              'Concierge services',
              'Priority customer support'
            ]}
          />
        </div>
      </div>
    </section>
  );
};

export default Plans;
