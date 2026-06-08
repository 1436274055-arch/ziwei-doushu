import { getBookBySlug, getChapter } from '@/lib/classics';
import Link from 'next/link';

export default function ChapterPage({ params }: { params: { book: string; chapter: string } }) {
  const book = getBookBySlug(params.book);
  const chapterIdx = parseInt(params.chapter);
  const chapter = getChapter(params.book, chapterIdx);

  if (!book || !chapter) return <div style={{ padding: 40, color: 'var(--tx-1)' }}>章节未找到</div>;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link href={`/library/${params.book}`} style={{ color: 'var(--tx-3)', fontSize: 13, textDecoration: 'none' }}>
          &larr; 返回 {book.title}
        </Link>
        <h1 style={{ fontSize: 22, color: 'var(--tx-1)', marginTop: 16 }}>{chapter.title}</h1>
        <div style={{ marginTop: 24, lineHeight: 2, color: 'var(--tx-2)' }}>
          {chapter.paragraphs?.map((p: any, i: number) => (
            <p key={i} style={{ marginBottom: 16 }}>{p.text}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
