import React from 'react';
import Link from 'next/link';
import { posts } from '@/data/posts';

export const metadata = {
  title: 'Journal | SwaddleShawls',
  description: 'Explore the SwaddleShawls journal for insights into authentic Indian craftsmanship, heritage block printing, and sustainable baby care.',
};

export default function JournalHub() {
  return (
    <main className="flex-grow pt-36 pb-28 px-6 relative pattern-paisley" style={{ backgroundColor: "var(--warm-cream)" }}>
      {/* Dynamic structured data for the hub page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "The SwaddleShawls Journal",
            "description": "Insights into authentic Indian craftsmanship, sustainable luxury, and finding the purest comfort for your little ones.",
            "url": "https://swaddleshawls.com/journal",
            "publisher": {
              "@type": "Organization",
              "name": "SwaddleShawls",
              "logo": {
                "@type": "ImageObject",
                "url": "https://swaddleshawls.com/SwaddleShawlsLogo.png"
              }
            }
          })
        }}
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-wider uppercase" style={{ backgroundColor: "var(--henna-50)", color: "var(--henna-600)" }}>
            ✦ The Journal ✦
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
            Heritage & Motherhood
          </h1>
          <div className="section-divider mb-8"></div>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: "var(--brown-500)" }}>
            Insights, guides, and stories exploring the intersection of authentic Indian craftsmanship, sustainable luxury, and finding the purest comfort for your little ones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <Link 
              href={`/journal/${post.slug}`} 
              key={post.slug} 
              className="group heritage-card bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="aspect-video sm:aspect-[4/3] overflow-hidden relative" style={{ backgroundColor: "var(--brown-50)" }}>
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] uppercase font-bold tracking-wider shadow-md" style={{ color: "var(--brown-800)" }}>
                  {post.category}
                </div>
              </div>
              <div className="p-6 md:p-8 flex flex-col flex-grow">
                <div className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: "var(--henna-500)" }}>
                  {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {post.readTime}
                </div>
                <h3 className="text-xl font-bold mb-4 line-clamp-3 leading-snug" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
                  {post.title}
                </h3>
                <p className="text-sm line-clamp-3 mb-6 flex-grow leading-relaxed" style={{ color: "var(--brown-500)" }}>
                  {post.description}
                </p>
                <div className="flex items-center gap-2 mt-auto text-sm font-bold transition-colors group-hover:text-emerald-700" style={{ color: "var(--brown-800)" }}>
                  Read Article
                  <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
