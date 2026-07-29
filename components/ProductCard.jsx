import Link from 'next/link';
import ShareButtons from './ShareButtons';
import { ADMIN_WHATSAPP_NUMBER } from '@/lib/config';

const formatIDR = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

export default function ProductCard({ product, categoryName }) {
  const waMessage = encodeURIComponent(
    `Halo HerS Culinary, saya mau pesan "${product.name}" (${formatIDR(product.price)}).`
  );

  return (
    <div className="card group relative flex flex-col overflow-hidden">
      <div className="absolute right-2 top-2 z-10">
        <ShareButtons productId={product.id} productName={product.name} price={product.price} compact />
      </div>

      <Link href={`/produk/${product.id}`} className="block">
        <div className="aspect-square w-full overflow-hidden bg-creamDeep">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">🍽️</div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {categoryName && (
          <span className="w-fit rounded-full bg-brandGold/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brandRedDark">
            {categoryName}
          </span>
        )}
        <Link href={`/produk/${product.id}`}>
          <h3 className="line-clamp-2 font-display text-lg leading-tight text-brandBrown">{product.name}</h3>
        </Link>
        <p className="mt-1 font-display text-xl text-brandRed">{formatIDR(product.price)}</p>

        <a
          href={`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-3 !py-2 text-sm"
        >
          Pesan via WhatsApp
        </a>
      </div>
    </div>
  );
}
