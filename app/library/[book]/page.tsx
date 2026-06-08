import { getBookBySlug } from '@/lib/classics';
import Link from 'next/link';

export default function BookPage({ params }: { params: { book: string } }) {
  const book = getBookBySlug(params.book);
  if (!book) return <div style={{ padding: 40, color: 'var(--tx-1)' }}>书籍未找到</div>;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link href="/library" style={{ color: 'var(--tx-3)', fontSize: 13, textDecoration: 'none' }}>
          &larr; 返回图书馆
        </Link>
        <h1 style={{ fontSize: 24, color: 'var(--tx-1)', marginTop: 16 }}>{book.title}</h1>
        <p style={{ color: 'var(--tx-3)', marginTop: 8 }}>{book.author} · {book.chapters.length} 章</p>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {book.chapters.map((ch: any, i: number) => (
            <Link key={i} href={`/library/${params.book}/${i}`}
              style={{ padding: '12px 16px', border: '1px solid var(--bdr)', borderRadius: 8, color: 'var(--tx-2)', textDecoration: 'none', fontSize: 14 }}>
              第{i + 1}章 · {ch.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
