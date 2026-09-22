import Link from "next/link";
import { ShieldCheck, Award, Share2, Sparkles, CheckCircle2, ArrowRight, ExternalLink, QrCode, Check } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#E8FCCF] text-[#134611] font-sans selection:bg-[#E8FCCF] selection:text-[#134611]">
      {/* Header */}
      <header className="border-b border-[#E8FCCF] bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#134611] text-[#E8FCCF] p-2 rounded-xl shadow-md border border-[#134611]">
              <Award className="w-5 h-5 text-[#E8FCCF]" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#134611]">CredFolio</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[#134611] hover:text-[#3E8914] font-extrabold text-sm transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-[#3E8914] hover:bg-[#134611] text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm border border-[#3E8914] transition-all hover:shadow hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Your Link
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#E8FCCF]/50 text-[#134611] px-4 py-1.5 rounded-full text-xs font-extrabold mb-6 border border-[#3E8914]/30 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#3E8914]" />
            <span>Verified Credential Showcase</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[#134611] tracking-tight leading-tight">
            One Link for All Your{" "}
            <span className="bg-[#E8FCCF] text-[#134611] px-3 py-0.5 rounded-xl inline-block shadow-sm border border-[#3E8914]/30">
              Verified Credentials
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#3E8914] max-w-2xl mx-auto leading-relaxed font-semibold">
            Stop cluttering your resume with messy links and PDF attachments. Gather your Coursera, AWS, Google, and university credentials onto one verified showcase page.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-[#3E8914] hover:bg-[#134611] text-white text-base font-extrabold px-8 py-3.5 rounded-xl shadow-md border border-[#3E8914] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Build Your Showcase</span>
              <ArrowRight className="w-4 h-4 text-[#E8FCCF]" />
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-16 bg-white border-t border-[#E8FCCF]">
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#E8FCCF] p-6 rounded-2xl border-2 border-[#E8FCCF] hover:border-[#134611] transition-all shadow-sm group">
              <div className="w-12 h-12 bg-[#134611] rounded-xl flex items-center justify-center text-[#E8FCCF] mb-4 border border-[#134611] shadow-sm">
                <ShieldCheck className="w-6 h-6 text-[#E8FCCF]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#134611] mb-2 group-hover:text-[#3E8914] transition-colors">Resume & LinkedIn Ready</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Designed specifically to sit next to your resume or bio. Recruiters can verify credentials instantly without downloading attachments.
              </p>
            </div>

            <div className="bg-[#E8FCCF] p-6 rounded-2xl border-2 border-[#E8FCCF] hover:border-[#134611] transition-all shadow-sm group">
              <div className="w-12 h-12 bg-[#134611] rounded-xl flex items-center justify-center text-[#E8FCCF] mb-4 border border-[#134611] shadow-sm">
                <Share2 className="w-6 h-6 text-[#E8FCCF]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#134611] mb-2 group-hover:text-[#3E8914] transition-colors">Instant QR Generator</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Generate crisp QR codes for printed resumes, business cards, or email signatures in one simple click.
              </p>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8FCCF] py-8 text-center text-slate-600 text-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3E8914] border border-[#134611]"></div>
            <span className="font-bold text-[#134611]">© {new Date().getFullYear()} CredFolio</span>
          </div>
          <div className="flex gap-6 text-xs text-[#3E8914] font-extrabold">
            <Link href="/privacy" className="hover:text-[#134611] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#134611] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

