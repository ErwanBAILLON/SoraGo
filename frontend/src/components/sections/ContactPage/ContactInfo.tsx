import React from 'react';

const ContactInfo: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Email Contact */}
      <div className="flex items-start space-x-4">
        <div className="bg-primary bg-opacity-10 p-3 rounded-full">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-contrast">Email</h3>
          <p className="text-gray-600 mt-1">For general inquiries:</p>
          <a href="mailto:info@sorago.com" className="text-primary hover:underline">info@sorago.com</a>
          <p className="text-gray-600 mt-1">For support:</p>
          <a href="mailto:support@sorago.com" className="text-primary hover:underline">support@sorago.com</a>
        </div>
      </div>
      
      {/* Phone Contact */}
      <div className="flex items-start space-x-4">
        <div className="bg-primary bg-opacity-10 p-3 rounded-full">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-contrast">Phone</h3>
          <p className="text-gray-600 mt-1">Main Office:</p>
          <a href="tel:+33123456789" className="text-primary hover:underline">+33 1 23 45 67 89</a>
          <p className="text-gray-600 mt-1">Customer Support:</p>
          <a href="tel:+33123456790" className="text-primary hover:underline">+33 1 23 45 67 90</a>
          <p className="text-xs text-gray-500 mt-1">Available Monday-Friday, 9am-6pm</p>
        </div>
      </div>
      
      {/* Address Contact */}
      <div className="flex items-start space-x-4">
        <div className="bg-primary bg-opacity-10 p-3 rounded-full">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-contrast">Address</h3>
          <address className="text-gray-600 mt-1 not-italic">
            123 Avenue de la Liberté<br />
            75008 Paris<br />
            France
          </address>
          <p className="text-xs text-gray-500 mt-1">Near Arc de Triomphe</p>
        </div>
      </div>
      
      {/* Social Media */}
      <div className="flex items-start space-x-4">
        <div className="bg-primary bg-opacity-10 p-3 rounded-full">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-contrast">Follow Us</h3>
          <div className="flex space-x-4 mt-2">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63z" clipRule="evenodd" />
                <path d="M12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;