import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen dashboard-bg text-slate-100 font-sans flex flex-col relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-[400px] h-[400px] rounded-full bg-blue-500/6 blur-3xl" />
      </div>

      {/* Navigation */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/[0.08]"
        style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(24px)" }}>
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="text-xl font-semibold text-white">RainUSE Nexus</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm text-slate-400">
          <Link href="#" className="hover:text-white transition-colors duration-200">
            How it works
          </Link>
          <Link href="#" className="hover:text-white transition-colors duration-200">
            Markets
          </Link>
          <Link href="#" className="hover:text-white transition-colors duration-200">
            Details
          </Link>
        </nav>

        <Link
          href="/map"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all duration-200 shadow-lg shadow-blue-600/30 border border-blue-500/50"
        >
          <span>Open app</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-6 md:px-12 py-24 gap-16">
        <div className="flex-1 space-y-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              18 states · 50K+ buildings analyzed
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight">
              Identify water<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                savings opportunities
              </span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              Discover high-potential commercial buildings for rainwater harvesting and non-potable reuse.
              We map the intersection of high water costs, ESG goals, and recapture potential.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/map"
              className="px-7 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-xl shadow-blue-600/25 border border-blue-500/50"
            >
              <span>Explore buildings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#"
              className="px-7 py-3.5 rounded-xl text-slate-300 font-semibold hover:text-white transition-all duration-200 inline-flex items-center justify-center border border-white/10 hover:border-white/20"
              style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}
            >
              Learn methodology
            </Link>
          </div>
        </div>

        {/* Right side: Stats cards */}
        <div className="flex-1 flex flex-col gap-4 w-full max-w-sm">
          {[
            { value: "18", label: "States analyzed", color: "from-blue-500/20 to-blue-600/10", accent: "text-blue-400" },
            { value: "50K+", label: "Buildings scored", color: "from-cyan-500/20 to-cyan-600/10", accent: "text-cyan-400" },
            { value: "Real-time", label: "ROI calculations", color: "from-emerald-500/20 to-emerald-600/10", accent: "text-emerald-400" },
          ].map(({ value, label, color, accent }) => (
            <div
              key={label}
              className={`p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-br ${color} backdrop-blur-xl transition-all duration-300 hover:border-white/15 hover:scale-[1.01]`}
              style={{ background: undefined }}
            >
              <div className={`text-4xl font-black mb-1.5 ${accent}`}>{value}</div>
              <p className="text-slate-400 text-base">{label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer CTA */}
      <div className="relative z-10 border-t border-white/[0.06] px-6 md:px-12 py-8"
        style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-white mb-1">Ready to get started?</h3>
            <p className="text-sm text-slate-400">Launch the interactive map to identify properties and calculate ROI.</p>
          </div>
          <Link
            href="/map"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all duration-200 whitespace-nowrap shadow-lg shadow-blue-600/25 border border-blue-500/50"
          >
            <span>Enter app</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
