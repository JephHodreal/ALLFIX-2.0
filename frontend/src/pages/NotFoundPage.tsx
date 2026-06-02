import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/shared/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="text-8xl font-black text-brand-navy/10 dark:text-brand-green/10 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Page not found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={() => navigate(-1)} variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>Go Back</Button>
          <Button onClick={() => navigate('/')} icon={<Home className="w-4 h-4" />}>Home</Button>
        </div>
      </motion.div>
    </div>
  );
}
