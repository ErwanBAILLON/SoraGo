import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import { IMainLayoutProps } from './types';

export const MainLayout: React.FC<IMainLayoutProps> = ({ 
  children,
  transparentHeader = true
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header transparent={transparentHeader} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
