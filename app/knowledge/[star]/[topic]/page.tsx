import { getKnowledge, SLUG_TO_STAR } from '@/lib/seo/knowledge';
import { TOPIC_LABEL } from '@/lib/ziwei/db-analysis';
import Link from 'next/link';

export default function KnowledgeDetailPage({ params }: { params: { star: string; topic: string } }) {
  const starName = SLUG_TO_STAR[params.star] || params.star;
  const topicName = TOPIC_LABEL[params.topic] || params.topic;
  const data = getKnowledge(starName, params.topic as any);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link href="/knowledge" style={{ color: 'var(--tx-3)', fontSize: 13, textDecoration: 'none' }}>
          &larr; 返回知识库
        </Link>
        <h1 style={{ fontSize: 24, color: 'var(--tx-1)', marginTop: 16 }}>
          {starName} · {topicName}
        </h1>
        <div style={{ marginTop: 24, lineHeight: 1.8, color: 'var(--tx-2)', whiteSpace: 'pre-wrap' }}>
          {data?.main || data?.summary || '该条目内容正在整理中，敬请期待。'}
        </div>
      </div>
    </div>
  );
}
