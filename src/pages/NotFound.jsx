import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-5 text-center">
      <img src="/assets/logos/logo.png" alt="Klaro" className="h-14 mb-8 object-contain" />
      <p className="text-6xl font-black text-brand-600 mb-3">404</p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page not found</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link to="/"          className="btn-primary">Go home</Link>
        <Link to="/dashboard" className="btn-secondary">Dashboard</Link>
      </div>
    </div>
  );
}
