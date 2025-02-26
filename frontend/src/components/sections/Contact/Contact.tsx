import React from 'react';
import Link from 'next/link';

const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-contrast">Contact Us</h2>
          <p className="mb-8 text-gray-700 text-lg">
            Have questions? Our team is here to help you find the perfect mobility solution.
          </p>
          <div className="space-y-4">
            <p>Email: <a href="mailto:info@sorago.com" className="text-primary hover:underline">info@sorago.com</a></p>
            <p>Call: <a href="tel:+33123456789" className="text-primary hover:underline">+33 1 23 45 67 89</a></p>
            <div className="mt-8">
              <Link 
                href="/contact" 
                className="bg-primary hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-md transition duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
