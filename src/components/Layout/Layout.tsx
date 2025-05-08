
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { saveLastExploreTab, getLastExploreTab, saveLastBookshelfTab, getLastBookshelfTab } from '@/utils/cookies';

const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Handle persisting cookie preferences
  useEffect(() => {
    // For path matching, we just check if the path starts with /explore or /bookshelf
    if (location.pathname.startsWith('/bookshelf')) {
      // Get tab from URL parameters (if any)
      const urlParams = new URLSearchParams(location.search);
      const tabFromUrl = urlParams.get('tab');
      
      if (tabFromUrl) {
        // Save the tab from URL to cookies
        saveLastBookshelfTab(tabFromUrl);
      } else {
        // Get last bookshelf tab from cookies
        const lastTab = getLastBookshelfTab();
        if (lastTab) {
          // Ensure cookies are working
          saveLastBookshelfTab(lastTab);
        }
      }
    } else if (location.pathname.startsWith('/explore')) {
      // Get tab from URL parameters (if any)
      const urlParams = new URLSearchParams(location.search);
      const tabFromUrl = urlParams.get('tab');
      
      if (tabFromUrl) {
        // Save the tab from URL to cookies
        saveLastExploreTab(tabFromUrl);
      } else {
        // Get last explore tab from cookies
        const lastTab = getLastExploreTab();
        if (lastTab) {
          // Ensure cookies are working
          saveLastExploreTab(lastTab);
        }
      }
    }
  }, [location.pathname, location.search]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;
