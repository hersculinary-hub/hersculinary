import { NextResponse } from 'next/server';
import { listProducts, createProduct } from '@/lib/products';
import { requireApiSession } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  const products = await listProducts();
  return NextResponse.json({ products }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request) {
  if (!(await requireApiSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: 'Nama produk wajib diisi.' }, { status: 400 });
  }
  if (!body.categoryId) {
    return NextResponse.json({ error: 'Kategori wajib dipilih.' }, { status: 400 });
  }
  const product = await createProduct(body);
  return NextResponse.json({ product }, { status: 201 });
}
