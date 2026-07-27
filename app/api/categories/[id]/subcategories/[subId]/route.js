import { NextResponse } from 'next/server';
import { updateSubcategory, deleteSubcategory } from '@/lib/categories';
import { requireApiSession } from '@/lib/auth-server';

export async function PUT(request, { params }) {
  if (!(await requireApiSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: 'Nama sub kategori wajib diisi.' }, { status: 400 });
  }
  try {
    const sub = await updateSubcategory(params.id, params.subId, body.name);
    return NextResponse.json({ subcategory: sub });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await requireApiSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await deleteSubcategory(params.id, params.subId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
