import { NextResponse } from 'next/server';
import { listCategories, createCategory } from '@/lib/categories';
import { requireApiSession } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  const categories = await listCategories();
  return NextResponse.json({ categories }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request) {
  if (!(await requireApiSession('admin'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: 'Nama kategori wajib diisi.' }, { status: 400 });
  }
  const category = await createCategory(body.name);
  return NextResponse.json({ category }, { status: 201 });
}
