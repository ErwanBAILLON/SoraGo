/**
 * Sections barrel file
 * 
 * This file exports all section components used in the landing page.
 * This approach keeps imports clean and organized in page files.
 */

// Export all section components
export { default as Hero } from './Hero/Hero';
export { default as Features } from './Features/Features';
export { default as Plans } from './Plans/Plans';
export { default as Testimonials } from './Testimonials/Testimonials';
export { default as CTA } from './CTA/CTA';
export { default as Contact } from './Contact/Contact';

// Export contact page specific components
// Note: These don't need to be exported here if imported directly in the contact page
