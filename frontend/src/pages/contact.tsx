import React from 'react';
import { NextPage } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import ContactForm from '@/components/sections/ContactPage/ContactForm';
import ContactInfo from '@/components/sections/ContactPage/ContactInfo';
import ContactMap from '@/components/sections/ContactPage/ContactMap';

/**
 * SoraGo Contact Page
 */
const ContactPage: NextPage = () => {
  return (
    <MainLayout>
      {/* Page Header */}
      <div className="bg-primary py-16 mb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-primary-foreground text-center">Contact Us</h1>
          <p className="text-center text-primary-foreground/90 mt-4 max-w-2xl mx-auto">
            We&apos;re here to help with any questions about our car subscription services.
            Get in touch with our team today.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Contact Information Column */}
            <div className="p-8 bg-muted">
              <h2 className="text-2xl font-semibold mb-6 text-foreground">Get In Touch</h2>
              <ContactInfo />
            </div>
            
            {/* Contact Form Column */}
            <div className="p-8 lg:col-span-2 border-t md:border-t-0 md:border-l border-border">
              <h2 className="text-2xl font-semibold mb-6 text-foreground">Send Us a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
        
        {/* Map Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Find Us</h2>
          <div className="h-96 rounded-lg overflow-hidden shadow-lg">
            <ContactMap />
          </div>
          
          {/* Business Hours */}
          <div className="mt-8 bg-card rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Business Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-card-foreground">Main Office</h4>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
                  <li>Saturday: 10:00 AM - 4:00 PM</li>
                  <li>Sunday: Closed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-card-foreground">Customer Support</h4>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>Monday - Friday: 8:00 AM - 8:00 PM</li>
                  <li>Saturday: 10:00 AM - 5:00 PM</li>
                  <li>Sunday: 12:00 PM - 4:00 PM</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-12 bg-card rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-lg text-foreground">How soon can I get a car after subscribing?</h3>
              <p className="mt-2 text-muted-foreground">Depending on your location and vehicle availability, you can typically get a car within 24-48 hours after your subscription is approved.</p>
            </div>
            <div>
              <h3 className="font-medium text-lg text-foreground">Can I switch cars during my subscription period?</h3>
              <p className="mt-2 text-muted-foreground">Yes, our flexible plans allow you to switch vehicles based on your subscription tier. Premium plans offer more frequent swaps.</p>
            </div>
            <div>
              <h3 className="font-medium text-lg text-foreground">What happens if I need to cancel my subscription?</h3>
              <p className="mt-2 text-muted-foreground">You can cancel your subscription with a 30-day notice. Please contact our customer service for the specific details regarding your plan.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
