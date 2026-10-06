import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import WhatsAppFab from './components/WhatsAppFab';
import { CalculatorSheet } from './components/Calculator';
import { useApp } from './context/AppContext';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./pages/Admin'));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-moss-200 border-t-moss-600" />
        <span className="text-xs font-bold uppercase tracking-widest text-ink-400">Loading</span>
      </div>
    </div>
  );
}

function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-24 pt-16 sm:pb-8 sm:pt-[72px]">{children}</main>
      <Footer />
      <MobileNav />
      <WhatsAppFab />
      <CalculatorSheet />
    </div>
  );
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const { bootError } = useApp();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PublicLayout>
                <AnimatedPage>
                  <Home />
                </AnimatedPage>
              </PublicLayout>
            }
          />
          <Route
            path="/products"
            element={
              <PublicLayout>
                <AnimatedPage>
                  <Products />
                </AnimatedPage>
              </PublicLayout>
            }
          />
          <Route
            path="/calculator"
            element={
              <PublicLayout>
                <AnimatedPage>
                  <CalculatorPage />
                </AnimatedPage>
              </PublicLayout>
            }
          />
          <Route
            path="/about"
            element={
              <PublicLayout>
                <AnimatedPage>
                  <About />
                </AnimatedPage>
              </PublicLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicLayout>
                <AnimatedPage>
                  <Contact />
                </AnimatedPage>
              </PublicLayout>
            }
          />
          <Route path="/admin/*" element={<Admin />} />
          <Route
            path="*"
            element={
              <PublicLayout>
                <AnimatedPage>
                  <NotFound />
                </AnimatedPage>
              </PublicLayout>
            }
          />
        </Routes>
      </AnimatePresence>
      {bootError && (
        <div className="fixed bottom-24 left-1/2 z-[70] w-[92%] max-w-md -translate-x-1/2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 shadow-lift sm:bottom-6">
          API unreachable ({bootError}). Showing default values — start the server or set VITE_API_URL.
        </div>
      )}
    </Suspense>
  );
}
