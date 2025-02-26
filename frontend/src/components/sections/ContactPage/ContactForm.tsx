import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      // In a real application, this would be an API call to your backend
      // await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      setSubmitStatus('success');
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      setErrorMessage('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          Thank you for your message! We'll get back to you shortly.
        </div>
      )}
      
      {/* Error Message */}
      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}
      
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="John Doe"
        />
      </div>
      
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="john.doe@example.com"
        />
      </div>
      
      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="+33 1 23 45 67 89"
        />
      </div>
      
      {/* Subject Field */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          Subject *
        </label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Select a subject</option>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Subscription Plans">Subscription Plans</option>
          <option value="Vehicle Information">Vehicle Information</option>
          <option value="Technical Support">Technical Support</option>
          <option value="Billing Question">Billing Question</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="How can we help you?"
        ></textarea>
      </div>
      
      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 flex justify-center items-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : 'Send Message'}
        </button>
      </div>
      
      {/* Privacy Policy */}
      <div className="text-xs text-gray-500">
        By submitting this form, you agree to our <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a> and consent to be contacted regarding your request.
      </div>
    </form>
  );
};

export default ContactForm;
