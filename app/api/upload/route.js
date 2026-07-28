import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireApiSession } from '@/lib/auth-server';

export const runtime = 'nodejs';

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request) {
  if (!(await requireApiSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          'Penyimpanan foto belum diaktifkan. Buka Vercel → project ini → tab Storage → Create Database → pilih Blob, lalu Connect ke project ini.'
      },
      { status: 500 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Tidak ada file yang diunggah.' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Format file harus JPG, PNG, WEBP, atau GIF.' }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Ukuran file maksimal 8MB.' }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
  const key = `produk/${Date.now()}-${safeName}`;

  try {
    const blob = await put(key, file, {
      access: 'public',
      addRandomSuffix: true
    });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    return NextResponse.json({ error: 'Gagal mengunggah foto. Coba lagi.' }, { status: 500 });
  }
}
