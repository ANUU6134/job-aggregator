import React from 'react';
import { Toaster as HotToaster, ToastBar } from 'react-hot-toast';
import type { Toast as HotToast } from 'react-hot-toast';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#333',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      {(t: HotToast) => (
        <ToastBar toast={t}>
          {({  message }) => (
            <div className="flex items-center gap-3 p-3">
              {getIcon(t.type)}
              <div className="flex-1">{message}</div>
              {t.type !== 'loading' && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </HotToaster>
  );
};