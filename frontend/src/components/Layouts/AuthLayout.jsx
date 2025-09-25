import Navbar from '../Navbar';
import Footer from '../Footer';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const AuthLayout = ({ children }) => {
  const { error } = useContext(AuthContext);
  return (
    <div>
      {/* Navbar at absolute top - no container div */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black">
        <Navbar />
      </div>
      {error && <div className="alert alert-error m-4">{error}</div>}
      <main className="container mx-auto p-4 min-h-screen">{children}</main>
        <Footer />
    </div>
  );
};

export default AuthLayout;