import Link from "next/link";
import { ArrowRight, Search, Menu } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 text-slate-800 font-sans selection:bg-blue-500/30 selection:text-blue-900 flex flex-col pt-6 pb-6 px-4 md:px-12 relative overflow-hidden">
      {/* Background color blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-300/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-300/30 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-200/30 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto rounded-3xl border border-white/60 bg-white/40 backdrop-blur-3xl shadow-[0_8px_60px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col relative z-10">

        {/* Top Navbar */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-white/60 bg-white/30 backdrop-blur-xl">
          <div className="flex items-center space-x-12">
            <div className="text-xl font-medium tracking-tight text-slate-800 flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <span>RainUSE Nexus</span>
            </div>

            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-500">
              <Link href="#" className="text-emerald-600 border-b-2 border-emerald-500 pb-1 -mb-[3px]">
                Home
              </Link>
              <Link href="#" className="hover:text-slate-800 transition-colors flex items-center gap-1">
                <span className="text-emerald-500 text-lg leading-none">+</span> Methodology
              </Link>
              <Link href="#" className="hover:text-slate-800 transition-colors flex items-center gap-1">
                <span className="text-emerald-500 text-lg leading-none">+</span> Markets
              </Link>
              <Link href="#" className="hover:text-slate-800 transition-colors">
                Case Studies
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-500">
            <button className="hover:text-slate-800 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <Link href="#" className="hover:text-slate-800 transition-colors">
              Contact Us
            </Link>
            <div className="pl-6 border-l border-slate-200">
              <Link href="#" className="flex items-center gap-2 text-slate-700 hover:text-emerald-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>ENTER PORTAL</span>
              </Link>
            </div>
          </div>
          <button className="md:hidden text-slate-700">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Hero Content */}
        <div className="flex-1 flex flex-col md:flex-row relative">

          {/* Left Content Area */}
          <div className="w-full md:w-[45%] flex flex-col justify-center px-10 py-12 md:pl-20 z-10">
            <h1 className="text-5xl md:text-6xl lg:text-[72px] font-semibold leading-[1.1] text-slate-800 mb-8 tracking-tight">
              Prospecting<br />
              for Water<br />
              Independence
            </h1>

            <p className="text-slate-500 text-base max-w-md leading-relaxed mb-12 font-light">
              Identify high-potential commercial buildings for rainwater and non-potable reuse. We're leading the charge to make real estate sustainable, mapping the intersection of high water costs, ESG mandates, and robust recapture potential.
            </p>

            <button className="bg-slate-800 text-white rounded-full px-8 py-3.5 text-sm font-semibold inline-flex items-center space-x-2 w-max hover:bg-slate-700 transition-colors">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span>LEARN MORE</span>
            </button>
          </div>

          {/* Right Visual Area */}
          <div className="w-full md:w-[65%] absolute right-0 top-0 bottom-0 overflow-hidden hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-50/60 to-cyan-100/40 z-0"/>

            {/* Minimalist 3D structural hint layer */}
            <div className="absolute bottom-20 right-20 w-[400px] h-[500px] z-10">
              {/* Building face 1 (left) */}
              <div className="absolute bottom-0 right-[200px] w-[180px] h-[400px] bg-gradient-to-t from-slate-200/80 to-white/60 transform -skew-y-12 origin-bottom-right border border-blue-200/60 shadow-[inset_-20px_0_40px_rgba(148,163,184,0.2)] backdrop-blur-sm">
                 <div className="w-full h-full opacity-30 bg-[linear-gradient(rgba(59,130,246,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.15)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
                 <div className="absolute top-10 left-4 w-2 h-8 bg-amber-400/70 shadow-[0_0_15px_rgba(251,191,36,0.4)] rounded-sm"></div>
                 <div className="absolute top-32 left-12 w-2 h-8 bg-amber-300/60 shadow-[0_0_10px_rgba(251,191,36,0.3)] rounded-sm"></div>
                 <div className="absolute top-44 left-24 w-2 h-8 bg-blue-400/70 shadow-[0_0_15px_rgba(96,165,250,0.4)] rounded-sm"></div>
              </div>

              {/* Building face 2 (right) */}
              <div className="absolute bottom-0 right-[20px] w-[180px] h-[400px] bg-gradient-to-t from-slate-100/90 to-white/50 transform skew-y-12 origin-bottom-left border-t border-r border-blue-100/50 backdrop-blur-sm">
                <div className="w-full h-full opacity-20 bg-[linear-gradient(rgba(59,130,246,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.15)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                <div className="absolute top-[30%] left-0 w-full h-[40%] bg-gradient-to-b from-amber-300/20 via-amber-200/10 to-transparent">
                   <div className="w-full h-full opacity-40 bg-[linear-gradient(rgba(251,191,36,0.5)_2px,transparent_2px),linear-gradient(90deg,rgba(251,191,36,0.3)_2px,transparent_2px)] bg-[size:20px_10px]"></div>
                </div>
              </div>

              {/* Building roof */}
              <div className="absolute bottom-[400px] right-[20px] w-[180px] h-[100px] bg-gradient-to-br from-white/70 to-slate-100/60 transform -skew-x-[45deg] scale-y-50 origin-bottom-left flex items-center justify-center border border-emerald-300/40 shadow-[inset_0_0_20px_rgba(16,185,129,0.08)] backdrop-blur-sm">
                <div className="w-1/2 h-1/2 bg-emerald-100/60 border border-emerald-400/40 rounded flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.6)]"></div>
                </div>
              </div>

               <div className="absolute bottom-[-40px] right-[-100px] w-[600px] h-[300px] bg-gradient-to-r from-blue-100/20 to-transparent transform rotate-[-12deg] skew-x-[45deg] z-[-1] pointer-events-none blur-[2px] border-l border-blue-200/30"></div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/20 to-transparent pointer-events-none z-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent pointer-events-none z-20" />
          </div>
        </div>

        {/* Bottom Call to Action Bar */}
        <div className="w-full bg-white/50 backdrop-blur-xl border-t border-white/60 py-4 px-8 mt-auto z-30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-12 w-full md:w-auto">
              <div>
                <h3 className="text-slate-700 font-medium text-sm">Ready to explore non-potable reuse?</h3>
              </div>
              <p className="text-slate-500 text-sm max-w-md">
                Launch the interactive map to identify properties, calculate ROI, and generate AI-driven investment briefs instantly.
              </p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto self-end md:self-auto">
              <Link
                href="/map"
                className="flex items-center gap-3 text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors ml-auto md:ml-0 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/60 border border-slate-200 flex items-center justify-center group-hover:border-emerald-400 group-hover:bg-emerald-50 transition-all shadow-sm">
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
