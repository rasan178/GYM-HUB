import { AuthProvider } from '../context/AuthContext';
import { PlanProvider } from '../context/PlanContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <PlanProvider>
        <Component {...pageProps} />
      </PlanProvider>
    </AuthProvider>
  );
}

export default MyApp;