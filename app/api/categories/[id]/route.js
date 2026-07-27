import { NextResponse } from 'next/server';
import { updateCategory, deleteCategory } from '@/lib/categories';
import { requireApiSession } from '@/lib/auth-server';

export async function PUT(request, { params }) {
  if (!(await requireApiSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: 'Nama kategori wajib diisi.' }, { status: 400 });
  }
  try {
    const category = await updateCategory(params.id, body.name);
    return NextResponse.json({ category });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await requireApiSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await deleteCategory(params.id);
  return NextResponse.json({ ok: true });
}
