import { NextRequest } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? '';
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

function formatChartForPrompt(chart: any): string {
  const { birthInfo, lunarInfo, wuxingJuName, mingGongBranch, shenGongBranch } = chart;
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];

  let text = '## 用户命盘信息\n';
  text += `出生：${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日 ${branches[birthInfo.hour]}时，${birthInfo.gender === 'male' ? '男' : '女'}\n`;
  text += `农历：${lunarInfo.lunarYear}年${lunarInfo.lunarMonth}月${lunarInfo.lunarDay}日，${stems[lunarInfo.yearStem]}${branches[lunarInfo.yearBranch]}年\n`;
  text += `五行局：${wuxingJuName}\n`;
  text += `命宫：${branches[mingGongBranch]}，身宫：${branches[shenGongBranch]}\n\n`;

  text += '## 十二宫详情\n';
  if (chart.palaces) {
    for (const p of chart.palaces) {
      const majorStars = p.stars?.filter((s: any) => s.type === 'major').map((s: any) => `${s.name}${s.brightness ? `(${s.brightness})` : ''}${s.siHua ? `[化${s.siHua}]` : ''}`).join('、') || '无主星';
      const otherStars = p.stars?.filter((s: any) => s.type !== 'major').map((s: any) => s.name).join('、') || '';
      const markers = [];
      if (p.isMingGong) markers.push('命宫');
      if (p.isShenGong) markers.push('身宫');
      if (p.isEmpty) markers.push(`借对宫(${p.borrowedFromName || ''})`);
      const marker = markers.length > 0 ? ` 【${markers.join('·')}】` : '';
      text += `- **${p.name}**（${branches[p.branch]}）${marker}：主星 - ${majorStars}${otherStars ? '；辅星 - ' + otherStars : ''}\n`;
    }
  }

  text += '\n## 大限\n';
  if (chart.daXians) {
    for (const dx of chart.daXians) {
      const current = chart.currentAge && chart.currentAge >= dx.startAge && chart.currentAge <= dx.endAge ? ' ← 当前' : '';
      text += `- ${dx.startAge}-${dx.endAge}岁：${dx.palaceName}${current}\n`;
    }
  }

  return text;
}

export async function POST(req: NextRequest) {
  if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'sk-placeholder') {
    return new Response(JSON.stringify({ error: '请设置 DEEPSEEK_API_KEY 环境变量' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { chart, messages } = await req.json();

    const chartDesc = chart ? formatChartForPrompt(chart) : '';

    const systemPrompt = `你是倪海夏（倪海厦）体系的紫微斗数命理专家。你精通紫微斗数排盘、十四主星、十二宫位、四化飞星、格局分析、大限流年解读。

请基于以下用户命盘信息，用中文进行专业解读。回答要结合倪海夏《天纪》体系的理论，语言通俗易懂，避免过于玄学。

${chartDesc}

注意：
- 回答简洁有力，每次回复控制在200-500字
- 结合具体宫位和星曜进行解读，不要泛泛而谈
- 保持专业但亲切的语气
- 对于不确定的内容，坦诚说明`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: apiMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: `AI API 错误: ${response.status} ${errText}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stream the response back to client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;

              const data = trimmed.slice(6);
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: { text: content } })}\n\n`));
                }
              } catch {
                // skip unparseable chunks
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: `服务器错误: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
