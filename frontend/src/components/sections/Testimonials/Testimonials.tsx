import React from 'react';
import { TestimonialProps } from './types';

const Testimonial: React.FC<TestimonialProps> = ({ text, name, title }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all">
      <div className="text-primary mb-4 text-3xl">"</div>
      <p className="italic text-gray-700 mb-6">{text}</p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
          <span className="text-gray-600 font-medium">{name.charAt(0)}</span>
        </div>
        <div>
          <h4 className="font-bold text-contrast">{name}</h4>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  );
};

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-contrast">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Testimonial
            text="SoraGo has completely changed how I think about car ownership. The flexibility to switch between vehicles based on my needs is incredible!"
            name="Sophie Martin"
            title="Freelance Photographer"
          />
          <Testimonial
            text="The customer service at SoraGo is top-notch. When I had an issue with my rental, they solved it within hours."
            name="Thomas Dubois"
            title="Business Consultant"
          />
          <Testimonial
            text="As someone who only needs a car occasionally, SoraGo's Basic Plan is perfect for me. Great value for money!"
            name="Emma Laurent"
            title="Software Developer"
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
