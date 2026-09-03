import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShareButtons from '@/components/ShareButtons';
import ProductGallery from '@/components/ProductGallery';
import { getProduct } from '@/lib/products';
import { getCategory } from '@/lib/categories';
import { ADMIN_WHATSAPP_NUMBER } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const formatIDR = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  if (!product) return { title: 'Produk tidak ditemukan — HerS Culinary' };
  return {
    title: `${product.name} — HerS Culinary`,
    description: product.description || 'Frozen food & kopi pilihan HerS Culinary',
    openGraph: {
      title: `${product.name} — HerS Culinary`,
      description: product.description || '',
      images: product.imageUrl ? [product.imageUrl] : []
    }
  };
}

export default async function ProductDetailPage({ params }) {
  const product = await getProduct(params.id);
  if (!product || !product.active) notFound();

  const category = product.categoryId ? await getCategory(product.categoryId) : null;
  const subcategory = category?.subcategories?.find((s) => s.id === product.subcategoryId);

  const waMessage = encodeURIComponent(
    `Halo HerS Culinary, saya mau pesan "${product.name}" (${formatIDR(product.price)}).`
  );

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link href="/" className="text-sm font-bold text-brandRed">
          ← Kembali ke katalog
        </Link>

        <div className="mt-4 grid gap-8 md:grid-cols-2">
          <ProductGallery images={product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : []} alt={product.name} />

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {category && <span className="ribbon">{category.name}</span>}
              {subcategory && <span className="ribbon ribbon-gold">{subcategory.name}</span>}
            </div>
            <h1 className="font-display text-3xl text-brandBrown">{product.name}</h1>
            <p className="font-display text-3xl text-brandRed">{formatIDR(product.price)}</p>
            {product.description && (
              <p className="text-brandBrown/70">{product.description}</p>
            )}
            <p className="text-sm text-brandBrown/50">Stok tersedia: {product.stock}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a href={`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${waMessage}`} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Pesan via WhatsApp
              </a>
              <ShareButtons productId={product.id} productName={product.name} price={product.price} />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
