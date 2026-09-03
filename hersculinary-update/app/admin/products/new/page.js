import AdminShell from '@/components/AdminShell';
import ProductForm from '@/components/ProductForm';

export default function NewProductPage() {
  return (
    <AdminShell title="Tambah Produk">
      <ProductForm />
    </AdminShell>
  );
}
