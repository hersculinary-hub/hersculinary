import { Anton, Nunito } from 'next/font/google';
import './globals.css';

const display = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display'
});

const body = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-body'
});

export const metadata = {
  title: 'HerS Culinary — Frozen Food & Kopi Pilihan',
  description:
    'Katalog produk frozen food dan kopi pilihan HerS Culinary. Lezat, praktis, siap dinikmati kapan saja.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${display.variable} ${body.variable} font-body bg-cream text-brandBrown`}>
        {children}
      </body>
    </html>
  );
}
