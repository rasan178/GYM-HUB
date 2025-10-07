import Navbar from '../Navbar';
import Footer from '../Footer';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const MainLayout = ({ children }) => {
  const { error } = useContext(AuthContext);
  
  return (
    <div className="min-h-screen bg-black">
      {/* Navbar at absolute top - no container div */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black">
        <Navbar />
      </div>
      
      {/* Enhanced Error Display - exclude account suspension errors */}
      {error && !error.includes('suspended') && !error.includes('deactivated') && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between bg-white text-black p-4 border-2 border-black shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                  !
                </div>
                <span className="font-semibold text-lg">{error}</span>
              </div>
              <button 
                className="text-black hover:bg-black hover:text-white transition-colors duration-200 p-2 border border-black"
                onClick={() => window.location.reload()}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content - starts immediately after navbar */}
      <main className="bg-black">
        {children}
      </main>
      
      {/* Footer */}
      <div className="bg-black text-white">
        <Footer />
      </div>
      
      {/* Enhanced Scroll to Top Button
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-white text-black w-12 h-12 rounded-full shadow-xl hover:bg-gray-200 border-2 border-white transition-all duration-300 transform hover:scale-110 z-40 flex items-center justify-center font-bold text-xl"
      >
        ↑
      </button> */}
    </div>
  );
};

export default MainLayout;