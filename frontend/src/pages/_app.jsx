import { AuthProvider } from '../context/AuthContext';
import { PlanProvider } from '../context/PlanContext';
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <PlanProvider>
          <Component {...pageProps} />
          <Toaster position="bottom-right" />
      </PlanProvider>
    </AuthProvider>
  );
}

export default MyApp;