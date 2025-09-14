import Navbar from '../Navbar';
import Footer from '../Footer';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const MainLayout = ({ children }) => {
  const { error } = useContext(AuthContext);
  return (
    <div>
      <Navbar />
      {error && <div className="alert alert-error m-4">{error}</div>}
      <main className="container mx-auto p-4 min-h-screen">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;