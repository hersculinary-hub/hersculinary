import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import CatalogBrowser from '@/components/CatalogBrowser';
import { listCategories } from '@/lib/categories';
import { listProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, products] = await Promise.all([listCategories(), listProducts()]);

  return (
    <main>
      <Navbar />
      <Hero />
      <CatalogBrowser categories={categories} products={products} />
      <Footer />
    </main>
  );
}
