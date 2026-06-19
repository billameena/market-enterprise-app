// We use react-hot-toast, but this component provides custom styling hooks
import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

export function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        success: {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        },
        error: {
          icon: <XCircle className="w-5 h-5 text-danger-500" />,
        },
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          borderRadius: '12px',
          fontSize: '14px',
          maxWidth: '380px',
          padding: '12px 16px',
        },
      }}
    />
  );
}

export { toast };
