import Navbar from '../Navbar';
import Footer from '../Footer';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const MainLayout = ({ children }) => {
  const { error } = useContext(AuthContext);
  
  return (
    <>
      {/* Navbar at absolute top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b-2 border-black">
        <Navbar />
      </div>
      
      <div className="min-h-screen bg-white text-black flex flex-col pt-16">
      
        {/* Enhanced Error Display */}
        {error && (
          <div className="w-full bg-black text-white">
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
      
        {/* Enhanced Main Content */}
        <main className="flex-1 bg-white">
          <div className="w-full">
          {children}
        </div>
      </main>
      
        {/* Enhanced Footer Container */}
        <div className="bg-black text-white border-t-4 border-black">
          <Footer />
        </div>
        
        {/* Decorative Elements */}
        <div className="fixed top-16 left-0 w-2 h-full bg-black opacity-10 pointer-events-none"></div>
        <div className="fixed top-16 right-0 w-2 h-full bg-black opacity-10 pointer-events-none"></div>
      </div>
      
      {/* Enhanced Scroll to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-black text-white w-12 h-12 rounded-full shadow-xl hover:bg-white hover:text-black border-2 border-black transition-all duration-300 transform hover:scale-110 z-40 flex items-center justify-center font-bold text-xl"
      >
        ↑
      </button>
      
      {/* Loading Indicator */}
      <div className="fixed top-16 left-0 w-full h-1 bg-white z-40">
        <div className="h-full bg-black w-0 transition-all duration-300"></div>
      </div>
    </>
  );

};

export default MainLayout;