import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'VedaAI – AI Assessment Creator',
  description: 'Create intelligent assessments powered by AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '10px',
              background: '#1A1A1A',
              color: '#fff',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#E8570E', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
