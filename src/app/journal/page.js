import React from 'react';
import Link from 'next/link';
import { posts } from '@/data/posts';

export const metadata = {
  title: 'Journal | SwaddleShawls',
  description: 'Explore the SwaddleShawls journal for insights into authentic Indian craftsmanship, heritage block printing, and sustainable baby care.',
};

export default function JournalHub() {
  // ── Separate hubs from spokes ──
  const hubs = posts.filter(p => p.hub);
  const spokes = posts.filter(p => !p.hub);

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
            Heritage &amp; Motherhood
          </h1>
          <div className="section-divider mb-8"></div>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: "var(--brown-500)" }}>
            Insights, guides, and stories exploring the intersection of authentic Indian craftsmanship, sustainable luxury, and finding the purest comfort for your little ones.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════
            HUB SECTIONS — Pillar Content
            Each hub gets a prominent featured card with its spokes beneath
           ═══════════════════════════════════════════════ */}
        {hubs.map((hub, hubIndex) => {
          // Find spoke articles that belong to this hub
          const hubSpokes = spokes.filter(s => s.hubSlug === hub.slug);

          return (
            <section key={hub.slug} className={hubIndex > 0 ? 'mt-24' : ''}>
              {/* ── Hub Label ── */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'linear-gradient(135deg, var(--henna-400), var(--terra-400))' }}></span>
                  <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--henna-600)' }}>
                    {hub.category} — Pillar Guide
                  </span>
                </div>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, var(--brown-200), transparent)' }}></div>
              </div>

              {/* ── Featured Hub Card (Full-Width) ── */}
              <Link
                href={`/journal/${hub.slug}`}
                className="group block rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 mb-10"
                style={{ border: '1px solid var(--brown-200)' }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Image side */}
                  <div className="aspect-video lg:aspect-auto lg:min-h-[380px] overflow-hidden relative" style={{ backgroundColor: "var(--brown-50)" }}>
                    <img 
                      src={hub.image} 
                      alt={hub.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/10"></div>
                    <div className="absolute top-5 left-5 px-3.5 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider shadow-lg" style={{ background: 'linear-gradient(135deg, var(--henna-500), var(--henna-600))', color: '#fff' }}>
                      ✦ Pillar Guide
                    </div>
                  </div>

                  {/* Content side */}
                  <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center bg-white">
                    <div className="text-xs font-bold mb-4 uppercase tracking-widest" style={{ color: "var(--henna-500)" }}>
                      {new Date(hub.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {hub.readTime}
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-5 leading-tight group-hover:text-henna-600 transition-colors" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
                      {hub.title}
                    </h2>
                    <p className="text-base leading-relaxed mb-8" style={{ color: "var(--brown-500)" }}>
                      {hub.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 group-hover:shadow-lg" style={{ background: 'linear-gradient(135deg, var(--henna-500), var(--henna-600))', color: '#fff' }}>
                        Read the Full Guide
                        <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </span>
                      {hubSpokes.length > 0 && (
                        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline" style={{ color: 'var(--brown-400)' }}>
                          + {hubSpokes.length} Related {hubSpokes.length === 1 ? 'Article' : 'Articles'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              {/* ── Spoke Articles — Connected via visual connector ── */}
              {hubSpokes.length > 0 && (
                <div className="relative pl-6 md:pl-10">
                  {/* Vertical connector line */}
                  <div className="absolute left-3 md:left-5 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(180deg, var(--henna-300), var(--brown-200), transparent)' }}></div>

                  {/* Spoke header */}
                  <div className="flex items-center gap-3 mb-6 relative">
                    <div className="absolute -left-6 md:-left-10 w-5 h-5 rounded-full flex items-center justify-center z-10" style={{ background: 'var(--warm-cream)', border: '2px solid var(--henna-300)' }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: 'var(--henna-400)' }}></div>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--brown-400)' }}>
                      Related Articles in this Series
                    </span>
                  </div>

                  {/* Spoke cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hubSpokes.map((spoke, i) => (
                      <Link 
                        href={`/journal/${spoke.slug}`} 
                        key={spoke.slug} 
                        className="group/spoke heritage-card bg-white rounded-2xl overflow-hidden shadow-md flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 relative"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        {/* Spoke connector dot */}
                        <div className="absolute -left-6 md:-left-10 top-10 w-3 h-3 rounded-full z-10" style={{ background: 'var(--warm-cream)', border: '2px solid var(--brown-300)' }}></div>
                        <div className="absolute -left-6 md:-left-10 top-[46px] w-[24px] md:w-[40px] h-px" style={{ background: 'var(--brown-200)' }}></div>

                        <div className="aspect-[4/3] overflow-hidden relative" style={{ backgroundColor: "var(--brown-50)" }}>
                          <img 
                            src={spoke.image} 
                            alt={spoke.title} 
                            className="w-full h-full object-cover transform group-hover/spoke:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[9px] uppercase font-bold tracking-wider shadow-md" style={{ color: "var(--brown-700)" }}>
                            {spoke.category}
                          </div>
                        </div>
                        <div className="p-5 md:p-6 flex flex-col flex-grow">
                          <div className="text-[10px] font-bold mb-2.5 uppercase tracking-widest" style={{ color: "var(--henna-500)" }}>
                            {new Date(spoke.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {spoke.readTime}
                          </div>
                          <h3 className="text-base font-bold mb-3 line-clamp-3 leading-snug" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
                            {spoke.title}
                          </h3>
                          <p className="text-sm line-clamp-2 mb-4 flex-grow leading-relaxed" style={{ color: "var(--brown-500)" }}>
                            {spoke.description}
                          </p>
                          <div className="flex items-center gap-2 mt-auto text-xs font-bold transition-colors group-hover/spoke:text-henna-500" style={{ color: "var(--brown-600)" }}>
                            Read Article
                            <svg className="w-3.5 h-3.5 transform transition-transform group-hover/spoke:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}

        {/* ── Standalone Articles (no hub association) ── */}
        {(() => {
          const orphanSpokes = spokes.filter(s => !s.hubSlug);
          if (orphanSpokes.length === 0) return null;
          return (
            <section className="mt-24">
              <div className="flex items-center gap-4 mb-10">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--brown-400)' }}></span>
                  <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--brown-500)' }}>
                    More from the Journal
                  </span>
                </div>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, var(--brown-200), transparent)' }}></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {orphanSpokes.map((post, i) => (
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
            </section>
          );
        })()}
      </div>
    </main>
  );
}
