import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  // للتحقق من أن الطلب قادم من جهة مصرح بها (اختياري لكن مفضل)
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new NextResponse('Unauthorized', { status: 401 });
  // }

  try {
    // 1. تصفير العدادات
    const { error } = await supabase
      .from('clinics')
      .update({ current_number: 0, status: 'active' }) // نعيد تفعيل العيادات
      .neq('current_number', 0); // نحدث فقط العيادات التي بها أرقام

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'All clinics reset to 0' });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
