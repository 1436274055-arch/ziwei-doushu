import { NextRequest, NextResponse } from 'next/server';
import { generateChart } from '@/lib/ziwei/algorithm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, month, day, hour, gender } = body;

    if (!year || !month || !day || hour === undefined || !gender) {
      return NextResponse.json({ error: '缺少必要的出生信息（year, month, day, hour, gender）' }, { status: 400 });
    }

    if (gender !== 'male' && gender !== 'female') {
      return NextResponse.json({ error: '性别必须是 male 或 female' }, { status: 400 });
    }

    const chart = generateChart({ year, month, day, hour, gender });
    return NextResponse.json(chart);
  } catch (e: any) {
    return NextResponse.json({ error: `命盘生成失败: ${e.message}` }, { status: 500 });
  }
}
