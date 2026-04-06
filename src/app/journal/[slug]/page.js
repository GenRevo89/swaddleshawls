import React from 'react';
import { notFound } from 'next/navigation';
import { posts } from '@/data/posts';
import AuthorBox from '@/components/AuthorBox';
import InlineProductAd from '@/components/InlineProductAd';
import Link from 'next/link';

// Pre-render all exported articles at build time for pristine CWV scores
export async function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = posts.find(p => p.slug === slug);
  if (!post) return { title: 'Article Not Found' };
  
  return {
    title: `${post.title} | SwaddleShawls Journal`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `https://swaddleshawls.com/journal/${post.slug}`,
      images: [{ url: post.image }],
    }
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const post = posts.find(p => p.slug === slug);
  if (!post) notFound();

  // Construct structured entity data for E-E-A-T analysis
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description,
    "image": `https://swaddleshawls.com${post.image}`,
    "datePublished": post.date,
    "author": {
      "@type": "Person",
      "name": "Krishna Patel",
      "url": "https://www.linkedin.com/in/krishna-patel-89039120",
      "jobTitle": "Artisanal Sourcing Director"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SwaddleShawls",
      "logo": {
        "@type": "ImageObject",
        "url": "https://swaddleshawls.com/SwaddleShawlsLogo.png"
      }
    }
  };

  return (
    <main className="flex-grow pt-36 pb-28 px-6 relative bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      
      <article className="max-w-3xl mx-auto relative z-10">
        <div className="mb-10 animate-fade-in-up">
          <Link href="/journal" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-8 transition-colors hover:text-henna-600" style={{ color: "var(--brown-400)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Journal
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider" style={{ backgroundColor: "var(--brown-50)", color: "var(--brown-600)" }}>
              {post.category}
            </span>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--henna-500)" }}>
              {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-xs font-bold tracking-widest text-slate-400 ml-auto hidden sm:block">
              {post.readTime}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>
            {post.title}
          </h1>
          
          <div className="aspect-video w-full rounded-2xl overflow-hidden mb-12 shadow-xl">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Content Injector */}
        <div className="prose prose-lg max-w-none" style={{ color: "var(--brown-700)" }}>
          {post.content.map((block, index) => {
            if (block.type === 'p') {
              return <p key={index} className="mb-8 font-light leading-loose text-[17px] md:text-lg">{block.text}</p>;
            }
            if (block.type === 'h2') {
              return <h2 key={index} className="text-2xl md:text-3xl font-bold mt-16 mb-8" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>{block.text}</h2>;
            }
            if (block.type === 'h3') {
              return <h3 key={index} className="text-xl md:text-2xl font-bold mt-12 mb-6" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>{block.text}</h3>;
            }
            if (block.type === 'image') {
              return (
                <figure key={index} className="my-12">
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img src={block.src} alt={block.alt} className="w-full h-auto object-cover" />
                  </div>
                  {block.caption && (
                    <figcaption className="text-center text-sm mt-4 italic" style={{ color: "var(--brown-400)" }}>{block.caption}</figcaption>
                  )}
                </figure>
              );
            }
            if (block.type === 'quote') {
              return (
                <blockquote key={index} className="my-12 pl-6 py-4 italic text-lg md:text-xl leading-relaxed" style={{ borderLeft: "4px solid var(--henna-400)", color: "var(--brown-600)" }}>
                  {block.text}
                  {block.attribution && <cite className="block mt-3 text-sm not-italic font-bold" style={{ color: "var(--brown-400)" }}>— {block.attribution}</cite>}
                </blockquote>
              );
            }
            if (block.type === 'list') {
              return (
                <ul key={index} className="my-8 space-y-3 pl-6">
                  {block.items.map((item, i) => (
                    <li key={i} className="text-[17px] md:text-lg font-light leading-relaxed list-disc" style={{ color: "var(--brown-700)" }}>{item}</li>
                  ))}
                </ul>
              );
            }
            if (block.type === 'ad') {
              return (
                <div key={index} className="my-16">
                  <InlineProductAd 
                    productId={block.productId}
                    title={block.title}
                    subtitle={block.subtitle}
                    image={block.image}
                    price={block.price}
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
        
        <div className="mt-16 pt-16 border-t" style={{ borderColor: "var(--brown-100)" }}>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: "var(--brown-400)" }}>Written By</h3>
          {/* E-E-A-T Author Injection */}
          <AuthorBox />
        </div>
      </article>
    </main>
  );
}
