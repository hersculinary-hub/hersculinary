import { notFound } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import ProductForm from '@/components/ProductForm';
import { getProduct } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  return (
    <AdminShell title="Edit Produk">
      <ProductForm initialProduct={product} />
    </AdminShell>
  );
}
