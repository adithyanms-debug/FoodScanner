import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ScanPage } from './pages/ScanPage';
import { ProductPage } from './pages/ProductPage';
import { ProfilePage } from './pages/ProfilePage';
import { HistoryPage } from './pages/HistoryPage';
import { BottomNav } from './components/layout/BottomNav';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="max-w-[480px] mx-auto min-h-screen bg-background relative shadow-2xl overflow-x-hidden">
          <Routes>
            <Route path="/" element={<ScanPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNav />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                borderRadius: '16px',
                background: '#F8F9FA',
                color: '#212121',
                boxShadow: '8px 8px 20px #BEBEBE, -8px -8px 20px #EBEBEB'
              }
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
