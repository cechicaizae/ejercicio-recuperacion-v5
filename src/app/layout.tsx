import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import AuthProvider from '@/components/AuthProvider';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Tickets',
  description: 'Sistema de gestión de tickets de soporte',
  icons: {
    icon: 'data:,' // Esto eliminará el favicon por defecto
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">{children}</main>
            <footer className="bg-gray-100 border-t border-gray-200 py-4 text-center text-sm text-gray-600">
              © {new Date().getFullYear()} Chicaiza Espinel Christian - Estrategia, Gestion y Adquisicion
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
