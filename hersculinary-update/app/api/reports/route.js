import { NextResponse } from 'next/server';
import { requireApiSession } from '@/lib/auth-server';
import { getReport } from '@/lib/reports';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request) {
  if (!(await requireApiSession('laporan'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '7d';
  const report = await getReport(range);
  return NextResponse.json({ report }, { headers: { 'Cache-Control': 'no-store' } });
}
