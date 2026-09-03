import { NextResponse } from 'next/server';
import { listInvoices, createInvoice } from '@/lib/invoices';
import { requireApiSession } from '@/lib/auth-server';

export async function GET() {
  if (!(await requireApiSession('pos'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const invoices = await listInvoices();
  return NextResponse.json({ invoices });
}

export async function POST(request) {
  if (!(await requireApiSession('pos'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Keranjang masih kosong.' }, { status: 400 });
  }
  const invoice = await createInvoice(body);
  return NextResponse.json({ invoice }, { status: 201 });
}
