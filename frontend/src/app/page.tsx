import Link from "next/link";
import { ArrowRight, Search, Menu } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-200 font-sans selection:bg-blue-500/30 selection:text-white flex flex-col pt-6 pb-6 px-4 md:px-12 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container - The mock browser/tablet window */}
      <div className="flex-1 w-full max-w-7xl mx-auto rounded-3xl border border-white/5 bg-[#0e131f]/60 backdrop-blur-3xl shadow-2xl overflow-hidden flex flex-col relative z-10">
        
        {/* Top Navbar */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#0a0f18]/40">
          <div className="flex items-center space-x-12">
            <div className="text-xl font-medium tracking-tight text-white flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <span>RainUSE Nexus</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
              <Link href="#" className="text-emerald-400 border-b-2 border-emerald-400 pb-1 -mb-[3px]">
                Home
              </Link>
              <Link href="#" className="hover:text-white transition-colors flex items-center gap-1">
                <span className="text-emerald-400 text-lg leading-none">+</span> Methodology
              </Link>
              <Link href="#" className="hover:text-white transition-colors flex items-center gap-1">
                <span className="text-emerald-400 text-lg leading-none">+</span> Markets
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Case Studies
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-400">
            <button className="hover:text-white transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <Link href="#" className="hover:text-white transition-colors">
              Contact Us
            </Link>
            <div className="pl-6 border-l border-white/10">
              <Link href="#" className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>ENTER PORTAL</span>
              </Link>
            </div>
          </div>
          <button className="md:hidden text-white">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Hero Content aligned roughly to image proportions */}
        <div className="flex-1 flex flex-col md:flex-row relative">
          
          {/* Left Content Area */}
          <div className="w-full md:w-[45%] flex flex-col justify-center px-10 py-12 md:pl-20 z-10">
            <h1 className="text-5xl md:text-6xl lg:text-[72px] font-semibold leading-[1.1] text-white mb-8 tracking-tight">
              Prospecting<br />
              for Water<br />
              Independence
            </h1>
            
            <p className="text-slate-400 text-base max-w-md leading-relaxed mb-12 font-light">
              Identify high-potential commercial buildings for rainwater and non-potable reuse. We're leading the charge to make real estate sustainable, mapping the intersection of high water costs, ESG mandates, and robust recapture potential.
            </p>

            <button className="bg-white text-[#0a0f18] rounded-full px-8 py-3.5 text-sm font-semibold inline-flex items-center space-x-2 w-max hover:bg-slate-200 transition-colors">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <span>LEARN MORE</span>
            </button>
          </div>

          {/* Right Visual Area (Mimicking the 3D building render) */}
          <div className="w-full md:w-[65%] absolute right-0 top-0 bottom-0 overflow-hidden hidden md:block">
            {/* CSS-based graphical representation instead of missing image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#0e172a] to-[#042f2e]/40 z-0"/>
            
            {/* Minimalist 3D structural hint layer */}
            <div className="absolute bottom-20 right-20 w-[400px] h-[500px] z-10">
              {/* Building face 1 (left) */}
              <div className="absolute bottom-0 right-[200px] w-[180px] h-[400px] bg-gradient-to-t from-[#050f28] to-[#122245] transform -skew-y-12 origin-bottom-right border border-blue-500/10 shadow-[inset_-20px_0_40px_rgba(0,0,0,0.5)]">
                 {/* Windows pattern via background grid */}
                 <div className="w-full h-full opacity-40 bg-[linear-gradient(rgba(59,130,246,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.2)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
                 {/* Glowing window accents */}
                 <div className="absolute top-10 left-4 w-2 h-8 bg-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.6)] rounded-sm"></div>
                 <div className="absolute top-32 left-12 w-2 h-8 bg-amber-400/60 shadow-[0_0_10px_rgba(251,191,36,0.4)] rounded-sm"></div>
                 <div className="absolute top-44 left-24 w-2 h-8 bg-blue-400/80 shadow-[0_0_15px_rgba(96,165,250,0.6)] rounded-sm"></div>
              </div>
              
              {/* Building face 2 (right) */}
              <div className="absolute bottom-0 right-[20px] w-[180px] h-[400px] bg-gradient-to-t from-[#020617] to-[#0a152e] transform skew-y-12 origin-bottom-left border-t border-r border-blue-500/5">
                <div className="w-full h-full opacity-20 bg-[linear-gradient(rgba(59,130,246,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                {/* Lit up amber segment mimicking the image's heat/light pattern */}
                <div className="absolute top-[30%] left-0 w-full h-[40%] bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent">
                   <div className="w-full h-full opacity-60 bg-[linear-gradient(rgba(251,191,36,0.8)_2px,transparent_2px),linear-gradient(90deg,rgba(251,191,36,0.5)_2px,transparent_2px)] bg-[size:20px_10px]"></div>
                </div>
              </div>
              
              {/* Building roof */}
              <div className="absolute bottom-[400px] right-[20px] w-[180px] h-[100px] bg-gradient-to-br from-[#0f2142] to-[#0a1529] transform -skew-x-[45deg] scale-y-50 origin-bottom-left flex items-center justify-center border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
                {/* Green roof element / cooling tower markers */}
                <div className="w-1/2 h-1/2 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]"></div>
                </div>
              </div>

               {/* Base landscape / ground grid */}
               <div className="absolute bottom-[-40px] right-[-100px] w-[600px] h-[300px] bg-gradient-to-r from-blue-900/5 to-transparent transform rotate-[-12deg] skew-x-[45deg] z-[-1] pointer-events-none blur-[2px] border-l border-blue-500/10"></div>
            </div>
            
            {/* Image placeholder / lighting overlay to unify the aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0e131f]/90 via-[#0e131f]/40 to-transparent pointer-events-none z-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e131f] via-transparent to-transparent pointer-events-none z-20" />
          </div>
        </div>

        {/* Bottom Call to Action Bar */}
        <div className="w-full bg-[#151b2b]/95 backdrop-blur border-t border-white/5 py-4 px-8 mt-auto z-30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-12 w-full md:w-auto">
              <div>
                <h3 className="text-white font-medium text-sm">Ready to explore non-potable reuse?</h3>
              </div>
              <p className="text-slate-400 text-sm max-w-md">
                Launch the interactive map to identify properties, calculate ROI, and generate AI-driven investment briefs instantly.
              </p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto self-end md:self-auto">
              <Link 
                href="/map" 
                className="flex items-center gap-3 text-sm font-medium text-white hover:text-emerald-400 transition-colors ml-auto md:ml-0 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-emerald-400/50 group-hover:bg-emerald-400/10 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <span>GET STARTED</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
