import { NextResponse } from 'next/server';
import { getProduct, updateProduct, deleteProduct } from '@/lib/products';
import { requireApiSession } from '@/lib/auth-server';

export async function GET(request, { params }) {
  const product = await getProduct(params.id);
  if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(request, { params }) {
  if (!(await requireApiSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  try {
    const product = await updateProduct(params.id, body);
    return NextResponse.json({ product });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await requireApiSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await deleteProduct(params.id);
  return NextResponse.json({ ok: true });
}
