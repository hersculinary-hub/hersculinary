import { NextResponse } from 'next/server';
import { addSubcategory } from '@/lib/categories';
import { requireApiSession } from '@/lib/auth-server';

export async function POST(request, { params }) {
  if (!(await requireApiSession('admin'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: 'Nama sub kategori wajib diisi.' }, { status: 400 });
  }
  try {
    const sub = await addSubcategory(params.id, body.name);
    return NextResponse.json({ subcategory: sub }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
