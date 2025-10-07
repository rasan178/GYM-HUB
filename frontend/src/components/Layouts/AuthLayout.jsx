import Navbar from '../Navbar';
import Footer from '../Footer';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const AuthLayout = ({ children }) => {
  const { error } = useContext(AuthContext);
  
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar at absolute top - no container div */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black">
        <Navbar />
      </div>
      
      {/* Main content with proper top padding to account for fixed navbar */}
      <div className="pt-16">
        {/* Error Display - positioned below navbar, exclude account suspension errors */}
        {error && !error.includes('suspended') && !error.includes('deactivated') && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Page content */}
        <main className="container mx-auto px-4 py-8 min-h-screen">
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default AuthLayout;