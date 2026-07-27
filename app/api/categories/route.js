import { NextResponse } from 'next/server';
import { listCategories, createCategory } from '@/lib/categories';
import { requireApiSession } from '@/lib/auth-server';

export async function GET() {
  const categories = await listCategories();
  return NextResponse.json({ categories });
}

export async function POST(request) {
  if (!(await requireApiSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: 'Nama kategori wajib diisi.' }, { status: 400 });
  }
  const category = await createCategory(body.name);
  return NextResponse.json({ category }, { status: 201 });
}
