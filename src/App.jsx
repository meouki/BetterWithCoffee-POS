import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Layouts
import POSLayout from './layouts/POSLayout';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import ProtectedRoute from './components/shared/ProtectedRoute';

// POS Pages
import POSInterface from './pages/pos/POSInterface';

// Dashboard Pages
import OverviewPage from './pages/dashboard/OverviewPage';
import OrdersPage from './pages/dashboard/OrdersPage';
import MenuManagementPage from './pages/dashboard/MenuManagementPage';
import InventoryPage from './pages/dashboard/InventoryPage';
import ReportsPage from './pages/dashboard/ReportsPage';
import UserManagementPage from './pages/dashboard/UserManagementPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AccountCreationPage from './pages/public/AccountCreationPage';
import LoginPage from './pages/public/LoginPage';

function App() {
  // Initialize Global Theme & Accent
  useEffect(() => {
    // Theme
    const isDark = localStorage.getItem('bwc_theme') === 'dark' ||
      (!localStorage.getItem('bwc_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    // Accent
    const savedAccent = localStorage.getItem('bwc_accent');
    if (savedAccent) {
      const accents = [
        { name: 'Caramel', color: '#D47C3A', hover: '#B8682E', muted: 'rgba(212, 124, 58, 0.15)' },
        { name: 'Sage', color: '#6A9E6F', hover: '#558259', muted: 'rgba(106, 158, 111, 0.15)' },
        { name: 'Dusty Rose', color: '#C47E85', hover: '#A6666D', muted: 'rgba(196, 126, 133, 0.15)' },
        { name: 'Slate Blue', color: '#4A7FA5', hover: '#396587', muted: 'rgba(74, 127, 165, 0.15)' },
        { name: 'Amber', color: '#F59E0B', hover: '#D97706', muted: 'rgba(245, 158, 11, 0.15)' }
      ];
      const selected = accents.find(a => a.name === savedAccent);
      if (selected) {
        document.documentElement.style.setProperty('--color-accent', selected.color);
        document.documentElement.style.setProperty('--color-accent-hover', selected.hover);
        document.documentElement.style.setProperty('--color-accent-muted', selected.muted);
      }
    }
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <Toaster
          position="bottom-left"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            },
            success: {
              iconTheme: {
                primary: 'var(--color-success)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--color-error)',
                secondary: 'white',
              },
            },
          }}
        />
        <ProductProvider>
          <OrderProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<LandingPage />} />
                </Route>
                <Route path="/login" element={<LoginPage />} />

                {/* Registration - Protected (Master only typically, allowing Admin for demo) */}
                <Route element={<ProtectedRoute allowedRoles={['Master', 'Admin']} />}>
                  <Route element={<PublicLayout />}>
                    <Route path="/register" element={<AccountCreationPage />} />
                  </Route>
                </Route>

                {/* POS Routes - All authenticated roles */}
                <Route element={<ProtectedRoute allowedRoles={['Master', 'Admin', 'Cashier']} />}>
                  <Route path="/pos" element={<POSLayout />}>
                    <Route index element={<POSInterface />} />
                  </Route>
                </Route>

                {/* Dashboard Routes - Master & Admin Only */}
                <Route element={<ProtectedRoute allowedRoles={['Master', 'Admin']} />}>
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Navigate to="overview" replace />} />
                    <Route path="overview" element={<OverviewPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="menu" element={<MenuManagementPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="users" element={<UserManagementPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </OrderProvider>
        </ProductProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
