import Image from "next/image";
import Link from "next/link";

const principles = [
  {
    title: "Proof before claims",
    body: "Wild En Tree builds products that help people show verified work, evidence, and contribution instead of relying on empty statements.",
  },
  {
    title: "Human-first systems",
    body: "We design software that keeps identity, trust, and opportunity understandable for real people, teams, and communities.",
  },
  {
    title: "Quiet power",
    body: "Our tools are meant to feel focused and reliable: less noise, better signals, and technology that gets out of the way.",
  },
];

const technologies = [
  { title: "Verified profiles", signal: "Identity" },
  { title: "Proof repositories", signal: "Evidence" },
  { title: "Streak systems", signal: "Momentum" },
  { title: "Recruiter signals", signal: "Opportunity" },
  { title: "Organization workspaces", signal: "Teams" },
  { title: "Private contact sharing", signal: "Control" },
];

const actions = [
  {
    label: "Trust",
    title: "Building records people can stand behind",
    body: "ProofX is the first WET platform focused on work that can be verified, shared, and reviewed.",
  },
  {
    label: "Growth",
    title: "Helping builders show momentum",
    body: "From streaks to tiers, we turn consistent effort into visible professional signals.",
  },
  {
    label: "Safety",
    title: "Keeping personal details permission-based",
    body: "Contact, location, and profile visibility are designed around user control.",
  },
];

const forestLayers = [
  "left-[4%] h-44 w-24 delay-0",
  "left-[15%] h-64 w-32 delay-200",
  "left-[28%] h-52 w-28 delay-500",
  "right-[28%] h-60 w-32 delay-300",
  "right-[14%] h-48 w-24 delay-700",
  "right-[3%] h-72 w-36 delay-100",
];

export default function WetPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8f6] text-slate-950">
      <style>{`
        @keyframes wetFloat {
          0%, 100% { transform: translate3d(0, 0, 0) rotateX(10deg) rotateY(-12deg); }
          50% { transform: translate3d(0, -18px, 0) rotateX(14deg) rotateY(10deg); }
        }
        @keyframes wetGrow {
          0%, 100% { transform: translateY(0) scaleY(1); opacity: 0.86; }
          50% { transform: translateY(-10px) scaleY(1.05); opacity: 1; }
        }
        @keyframes wetScan {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
        @keyframes wetPulseRing {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes wetDriftSlow {
          0%, 100% { transform: translate3d(-1.5%, 0, 0); }
          50% { transform: translate3d(1.5%, -10px, 0); }
        }
        @keyframes wetDriftFast {
          0%, 100% { transform: translate3d(2%, 0, 0); }
          50% { transform: translate3d(-2%, -18px, 0); }
        }
        @keyframes wetMist {
          0% { transform: translateX(-12%); opacity: 0.34; }
          50% { opacity: 0.62; }
          100% { transform: translateX(12%); opacity: 0.34; }
        }
        .wet-hero-3d {
          animation: wetFloat 7s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        .wet-tree {
          animation: wetGrow 5.5s ease-in-out infinite;
        }
        .wet-scan::after {
          animation: wetScan 4.5s linear infinite;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent);
          content: "";
          inset: 0;
          position: absolute;
        }
        .wet-ring {
          animation: wetPulseRing 4.8s ease-in-out infinite;
        }
        .wet-parallax-slow {
          animation: wetDriftSlow 13s ease-in-out infinite;
        }
        .wet-parallax-fast {
          animation: wetDriftFast 9s ease-in-out infinite;
        }
        .wet-mist {
          animation: wetMist 16s ease-in-out infinite alternate;
        }
        @supports (animation-timeline: view()) {
          .wet-scroll-rise {
            animation: wetScrollRise linear both;
            animation-range: entry 0% cover 55%;
            animation-timeline: view();
          }
          .wet-scroll-spin {
            animation: wetScrollSpin linear both;
            animation-range: entry 0% cover 70%;
            animation-timeline: view();
          }
          @keyframes wetScrollRise {
            from { opacity: 0.35; transform: translateY(80px) scale(0.94); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes wetScrollSpin {
            from { transform: rotateX(28deg) rotateY(-22deg) translateY(80px); }
            to { transform: rotateX(0deg) rotateY(0deg) translateY(0); }
          }
        }
      `}</style>

      <header className="sticky top-0 z-30 border-b border-emerald-900/10 bg-[#f7f8f6]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link className="flex items-center gap-3" href="/wet" rel="noreferrer" target="_blank">
            <Image alt="WET infinity logo" className="h-8 w-12 object-contain invert" height={32} src="/wet-infinity-logo-white.png" width={48} />
            <span className="text-sm font-semibold tracking-[0.18em]">WET</span>
          </Link>
          <Link className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800" href="/home">
            Open ProofX
          </Link>
        </div>
      </header>

      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden border-b border-emerald-900/10 bg-[linear-gradient(180deg,#ffffff_0%,#f1f7ef_55%,#dcefd8_100%)]">
        <div className="wet-mist pointer-events-none absolute left-[-10%] top-24 h-28 w-[120%] rounded-full bg-white/50 blur-3xl" />
        <div className="wet-parallax-slow pointer-events-none absolute left-[-8%] top-10 h-80 w-[116%] bg-[radial-gradient(circle_at_15%_50%,rgba(132,204,22,0.14),transparent_18%),radial-gradient(circle_at_52%_30%,rgba(16,185,129,0.12),transparent_20%),radial-gradient(circle_at_84%_55%,rgba(20,83,45,0.12),transparent_18%)]" />
        <div className="wet-parallax-fast pointer-events-none absolute left-[-8%] bottom-24 h-72 w-[116%] bg-[radial-gradient(circle_at_20%_70%,rgba(21,128,61,0.2),transparent_16%),radial-gradient(circle_at_72%_55%,rgba(34,197,94,0.16),transparent_18%)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(180deg,transparent,#123321_95%)]" />
        {forestLayers.map((tree) => (
          <div className={`wet-tree absolute bottom-0 hidden origin-bottom lg:block ${tree}`} key={tree}>
            <div className="mx-auto h-full w-4 rounded-t-full bg-[linear-gradient(180deg,#6b4423,#24150b)] shadow-[10px_0_30px_rgba(36,21,11,0.28)]" />
            <div className="absolute left-1/2 top-2 h-28 w-28 -translate-x-1/2 rounded-[45%_55%_44%_56%] bg-[linear-gradient(145deg,#225f3a,#68a85a)] shadow-[0_22px_55px_rgba(18,51,33,0.24)]" />
            <div className="absolute left-1/2 top-16 h-24 w-32 -translate-x-1/2 rounded-[52%_48%_58%_42%] bg-[linear-gradient(145deg,#17482e,#4e8d49)] shadow-[0_22px_55px_rgba(18,51,33,0.22)]" />
          </div>
        ))}

        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-12">
          <div className="relative z-10">
            <p className="inline-flex rounded-full border border-emerald-700/20 bg-white/70 px-3 py-1 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-800 shadow-sm backdrop-blur">
              Wild En Tree
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
              Building technology around what people can prove.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              WET is the company behind ProofX, creating trusted software for verified work, professional identity, and opportunity built on evidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800" href="/home">
                Enter ProofX
              </Link>
              <a className="inline-flex h-11 items-center justify-center rounded-md border border-emerald-900/15 bg-white/70 px-5 text-sm font-semibold text-slate-950 backdrop-blur transition hover:bg-white" href="#mission">
                Explore WET
              </a>
            </div>
          </div>

          <div className="relative z-10 min-h-[34rem] [perspective:1100px]">
            <div className="wet-parallax-slow absolute left-4 top-10 h-24 w-24 rounded-md border border-emerald-900/10 bg-white/35 shadow-[0_24px_60px_rgba(18,51,33,0.12)] backdrop-blur" />
            <div className="wet-parallax-fast absolute bottom-20 right-4 h-32 w-32 rounded-full border border-white/50 bg-emerald-300/20 blur-[1px]" />
            <div className="wet-hero-3d absolute left-1/2 top-1/2 h-[28rem] w-[min(92vw,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-md border border-white/20 bg-slate-950 p-5 text-white shadow-[0_45px_100px_rgba(15,23,42,0.42)]">
              <div className="wet-scan absolute inset-0 overflow-hidden rounded-md" />
              <div className="absolute inset-0 rounded-md bg-[linear-gradient(135deg,rgba(45,212,191,0.22),transparent_36%,rgba(132,204,22,0.15))]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Link className="flex items-center gap-3" href="/wet" rel="noreferrer" target="_blank">
                    <Image alt="Wild En Tree infinity mark" className="h-12 w-20 object-contain" height={48} priority src="/wet-infinity-logo-white.png" width={80} />
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">Wild En Tree</span>
                  </Link>
                  <span className="rounded-md border border-emerald-200/20 px-3 py-1 text-xs text-emerald-100">Live system</span>
                </div>

                <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full border border-emerald-200/20 bg-white/[0.04] shadow-[inset_0_0_70px_rgba(45,212,191,0.12)]">
                  <div className="wet-ring absolute h-56 w-56 rounded-full border border-emerald-200/20" />
                  <div className="wet-ring absolute h-72 w-72 rounded-full border border-lime-200/10 [animation-delay:0.8s]" />
                  <Image alt="Wild En Tree infinity mark" className="relative h-28 w-44 object-contain" height={112} src="/wet-infinity-logo-white.png" width={176} />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {["Trust", "Proof", "Growth"].map((item) => (
                    <div className="rounded-md border border-white/10 bg-white/[0.05] p-3" key={item}>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item}</p>
                      <p className="mt-2 text-lg font-semibold text-white">Verified</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-12" id="mission">
        <div className="wet-parallax-slow pointer-events-none absolute -right-24 top-8 h-64 w-64 rounded-full border border-emerald-900/10 bg-emerald-200/25 blur-2xl" />
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Our Mission</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            Make trust easier to earn, easier to verify, and harder to fake.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {principles.map((item) => (
            <article className="wet-scroll-rise group rounded-md border border-emerald-900/10 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(18,51,33,0.14)]" key={item.title}>
              <div className="mb-5 h-16 w-16 rounded-full border border-emerald-900/10 bg-[repeating-radial-gradient(circle,#dfe9da_0_3px,#ffffff_3px_7px)] transition group-hover:rotate-12" />
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-4 text-sm leading-6 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#6ee7b7,transparent)]" />
        <div className="wet-parallax-slow pointer-events-none absolute -left-32 top-8 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="wet-parallax-fast pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">Our Technologies</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              Tools for identity, proof, and progress.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-300">
              WET products are built to connect user activity with trustworthy records. ProofX starts with profiles, repositories, proofs, and signals that can grow over time.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {technologies.map((item) => (
              <div className="wet-scroll-rise rounded-md border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:bg-white/[0.07]" key={item.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">{item.signal}</p>
                <p className="mt-2 text-sm font-medium text-slate-100">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#153820] px-5 py-20 text-white sm:px-8 lg:px-12">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="wet-scroll-spin relative min-h-96 rounded-md border border-white/10 bg-[linear-gradient(180deg,#1d4d2d,#102617)] p-8 shadow-[0_28px_80px_rgba(18,51,33,0.28)]">
            <div className="wet-mist absolute left-0 top-12 h-20 w-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-8 h-72 w-8 rounded-t-full bg-[linear-gradient(180deg,#8b5a2b,#3d2411)]" />
            <div className="absolute bottom-52 left-1/2 h-56 w-72 -translate-x-1/2 rounded-[50%_50%_44%_56%] bg-[linear-gradient(145deg,#79b461,#22623b)] shadow-[0_28px_80px_rgba(5,20,12,0.32)]" />
            <div className="absolute bottom-40 left-[58%] h-44 w-64 -translate-x-1/2 rounded-[60%_40%_52%_48%] bg-[linear-gradient(145deg,#a0cf6f,#2d7a43)] shadow-[0_28px_80px_rgba(5,20,12,0.28)]" />
            <div className="absolute bottom-24 left-[38%] h-40 w-60 -translate-x-1/2 rounded-[42%_58%_48%_52%] bg-[linear-gradient(145deg,#5c9d4b,#17482e)] shadow-[0_28px_80px_rgba(5,20,12,0.28)]" />
            <div className="absolute bottom-8 right-8 rounded-md border border-white/10 bg-slate-950/70 p-4 backdrop-blur">
              <Image alt="Wild En Tree infinity mark" className="h-10 w-16 object-contain" height={40} src="/wet-infinity-logo-white.png" width={64} />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">Wild En Trees</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              A forest of products, each grown from proof.
            </h2>
            <p className="mt-5 text-base leading-7 text-emerald-50/80">
              The tree is our metaphor for durable work: roots in evidence, branches in opportunity, and rings that show progress over time.
            </p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="wet-parallax-fast pointer-events-none absolute left-[-10%] top-20 h-72 w-72 rounded-full bg-lime-200/35 blur-3xl" />
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Our Actions</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal">
              We are building for the people behind the work.
            </h2>
          </div>
          <div className="grid gap-4">
            {actions.map((item) => (
              <article className="wet-scroll-rise rounded-md border border-slate-200 bg-white p-6 shadow-sm" key={item.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{item.label}</p>
                <h3 className="mt-3 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-16 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">ProofX</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal">Start with the product WET is building now.</h2>
          </div>
          <Link className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800" href="/home">
            Go to ProofX
          </Link>
        </div>
      </section>
    </main>
  );
}
