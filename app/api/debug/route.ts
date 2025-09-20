import { NextResponse } from 'next/server';
import { getChatIdFromCookie } from '@/lib/getChatId';
import { getSupa } from '@/lib/supabase';

export async function GET() {
  const chatId = await getChatIdFromCookie();
  const supa = getSupa();

  const distinctIds = await supa
    .from('v_daily_totals')
    .select('chat_id', { count: 'exact', head: false })
    .limit(20);

  const mine = chatId
    ? await supa.from('v_daily_totals').select('*').eq('chat_id', chatId).order('day', { ascending: false }).limit(15)
    : { data: null, error: null };

  return NextResponse.json({
    ok: true,
    hasCookie: !!chatId,
    chatId,
    sampleDistinctChatIds: distinctIds.data?.map(r => r.chat_id) ?? [],
    myRecentRows: mine && 'data' in mine ? mine.data : null,
  });
}
