import { ShieldCheck, Map, Network } from "lucide-react";

export default function About() {
  return (
    <div className="w-full pb-24">
      <section className="bg-primary text-primary-foreground py-20 md:py-32 px-4 border-b border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 font-serif">PLAN THE REGION.</h1>
          <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Central Calendar is the definitive strategic coordination platform for Central Asia and the Caspian region.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            As the geopolitical center of gravity shifts, Central Asia has emerged as a vital node for global energy, logistics, and investment. However, visibility into high-level strategic events across the region has historically been fragmented.
          </p>
          <p>
            <strong>Central Calendar</strong> solves this coordination failure. By aggregating major economic forums, bilateral summits, investment conferences, and regional initiatives into a single, authoritative view, we provide the intelligence necessary for governments, corporations, and international institutions to navigate the region effectively.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 border-t border-border pt-16">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">Authoritative</h3>
            <p className="text-sm text-muted-foreground">Verified high-level events curated for institutional and corporate stakeholders.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Map className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">Regional Scope</h3>
            <p className="text-sm text-muted-foreground">Comprehensive coverage across Uzbekistan, Kazakhstan, Kyrgyzstan, Turkmenistan, and the Caspian basin.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Network className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">Strategic Focus</h3>
            <p className="text-sm text-muted-foreground">Prioritizing events that shape policy, drive investment, and build infrastructure.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
