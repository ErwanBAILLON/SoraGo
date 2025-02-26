import React from 'react';

/**
 * This component renders an embedded Google Maps view of the office location
 * In a real application, you might want to use a library like @react-google-maps/api
 * or integrate with Mapbox for more interactive functionality
 */
const ContactMap: React.FC = () => {
  return (
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.142047744348!2d2.292025676992035!3d48.87456213081363!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fc4a3909e3d%3A0xc19ec07c49663a9d!2sArc%20de%20Triomphe!5e0!3m2!1sen!2sfr!4v1633356126389!5m2!1sen!2sfr"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen={true}
      loading="lazy"
      title="SoraGo Office Location"
      referrerPolicy="no-referrer-when-downgrade"
      className="rounded-lg"
    ></iframe>
  );
};

export default ContactMap;
