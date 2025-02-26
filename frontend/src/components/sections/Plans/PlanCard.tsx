import React from 'react';
import { PlanCardProps } from './types';

const PlanCard: React.FC<PlanCardProps> = ({ 
  title, 
  description, 
  price, 
  features,
  isPopular = false
}) => {
  return (
    <div className={`bg-white h-full transition-all duration-300 ${
      isPopular ? 'border-t-4 border-accent' : ''
    }`}>
      <div className="p-8 h-full flex flex-col">
        {isPopular && (
          <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-wide text-accent">
            Most Popular
          </span>
        )}
        
        <h2 className="text-2xl font-bold text-contrast mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        
        <div className="mb-6">
          <span className="text-4xl font-bold text-primary">{price.split('/')[0]}</span>
          <span className="text-gray-500">/{price.split('/')[1]}</span>
        </div>
        
        <ul className="space-y-2 mb-8 flex-grow">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg className="w-5 h-5 text-accent mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        
        <button 
          className={`w-full py-3 font-medium transition-all duration-300 ${
            isPopular 
              ? 'bg-accent text-white hover:bg-amber-600' 
              : 'bg-gray-100 text-contrast hover:bg-gray-200'
          }`}
        >
          Choose Plan
        </button>
      </div>
    </div>
  );
};

export default PlanCard;
