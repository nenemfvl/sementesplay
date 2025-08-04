import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'accent' | 'purple';
  text?: string;
  fullScreen?: boolean;
}

export default function Loader({ 
  size = 'md', 
  color = 'accent', 
  text = 'Carregando...',
  fullScreen = false 
}: LoaderProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    white: 'border-white',
    accent: 'border-sss-accent',
    purple: 'border-purple-500'
  };

  const loader = (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-2 border-gray-300 ${sizeClasses[size]} ${colorClasses[color]} border-t-transparent`}></div>
      {text && (
        <div className="mt-3 text-sm text-gray-400 animate-pulse">
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-sss-dark/95 backdrop-blur-sm flex items-center justify-center z-50">
        {loader}
      </div>
    );
  }

  return loader;
}

// Loader específico para páginas
export function PageLoader() {
  return (
    <div className="min-h-screen bg-sss-dark flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-sss-accent border-t-transparent mx-auto mb-6"></div>
        <div className="text-sss-white text-lg font-medium mb-2">Carregando...</div>
        <div className="text-gray-400 text-sm">Aguarde um momento</div>
      </div>
    </div>
  );
}

// Loader para cards/conteúdo
export function CardLoader() {
  return (
    <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
      <div className="animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
            <div className="h-3 bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loader para tabelas
export function TableLoader() {
  return (
    <div className="bg-sss-medium rounded-lg border border-sss-light overflow-hidden">
      <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-sss-light last:border-b-0">
            <div className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/3"></div>
                </div>
                <div className="w-20 h-6 bg-gray-600 rounded"></div>
                <div className="w-16 h-6 bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 