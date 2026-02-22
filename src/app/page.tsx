import Link from "next/link";
import { Button } from "@/components/Button";
import { Card, CardTitle } from "@/components/Card";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-surface-border bg-[#0a0a0a]/90 backdrop-blur" role="banner">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4" aria-label="Main">
          <Link href="/" className="text-xl font-bold text-white" aria-label="GymBuddy AI home">
            GymBuddy AI
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm text-neutral-400 hover:text-white">
              How it works
            </a>
            <a href="#features" className="text-sm text-neutral-400 hover:text-white">
              Features
            </a>
            <a href="#faq" className="text-sm text-neutral-400 hover:text-white">
              FAQ
            </a>
            <Link href="/onboarding">
              <Button>Find my plan</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content" className="min-h-screen" tabIndex={-1}>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4" aria-labelledby="hero-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h1 id="hero-heading" className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            A workout plan that actually fits you
          </h1>
          <p className="mt-6 text-lg text-neutral-400">
            No guesswork. Tell us your goal, time, and equipment—get a clear weekly plan and simple nutrition guidance.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/onboarding">
              <Button className="min-w-[200px] py-3 text-base">
                Find my plan
              </Button>
            </Link>
            <Link href="/plan" className="text-accent hover:underline">
              See example plan
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-surface-border bg-surface py-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-6 px-4 text-sm text-neutral-400">
          <span>✓ Tailored to your goal & schedule</span>
          <span>✓ No equipment? We adapt</span>
          <span>✓ Joint-friendly options</span>
          <span>✓ Simple nutrition guidance</span>
        </div>
      </section>

      {/* Feature cards */}
      <section id="features" className="py-20 px-4" aria-labelledby="features-heading">
        <div className="mx-auto max-w-5xl">
          <h2 id="features-heading" className="text-center text-3xl font-bold text-white">
            Built for real life
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-neutral-400">
            Plans that respect your time, equipment, and any limitations.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <Card>
              <CardTitle>Your goal, your pace</CardTitle>
              <p className="mt-2 text-sm text-neutral-400">
                Fat loss, muscle gain, or strength—we pick the right template and adjust session length so you can finish on time.
              </p>
            </Card>
            <Card>
              <CardTitle>Equipment you have</CardTitle>
              <p className="mt-2 text-sm text-neutral-400">
                Full gym, dumbbells, bands, or bodyweight only. No exercises you can&apos;t do.
              </p>
            </Card>
            <Card>
              <CardTitle>Limitations respected</CardTitle>
              <p className="mt-2 text-sm text-neutral-400">
                Knee, back, or shoulder issues? We swap in safer alternatives so you stay consistent.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-surface-border py-20 px-4" aria-labelledby="how-heading">
        <div className="mx-auto max-w-3xl">
          <h2 id="how-heading" className="text-center text-3xl font-bold text-white">
            How it works
          </h2>
          <div className="mt-12 space-y-10">
            <div className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-black">
                1
              </span>
              <div>
                <h3 className="font-semibold text-white">Answer a few questions</h3>
                <p className="mt-1 text-neutral-400">
                  Goal, days per week, session length, experience, equipment, and any limitations.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-black">
                2
              </span>
              <div>
                <h3 className="font-semibold text-white">Get your plan</h3>
                <p className="mt-1 text-neutral-400">
                  We match you to a structured workout template and attach simple nutrition guidance.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-black">
                3
              </span>
              <div>
                <h3 className="font-semibold text-white">Follow and track</h3>
                <p className="mt-1 text-neutral-400">
                  View your week, see why each choice fits you, and revisit past plans anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-surface-border py-20 px-4" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-2xl">
          <h2 id="faq-heading" className="text-center text-3xl font-bold text-white">
            FAQ
          </h2>
          <dl className="mt-10 space-y-6">
            <div>
              <dt className="font-semibold text-white">Is this medical or dietary advice?</dt>
              <dd className="mt-1 text-neutral-400">
                No. GymBuddy AI gives general workout and nutrition guidance only. Consult a doctor or dietitian for personalized medical or dietary advice.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-white">Do I need to pay or sign up?</dt>
              <dd className="mt-1 text-neutral-400">
                Not for the MVP. Use the app locally; your plans are stored in your browser.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-white">Can I change my plan later?</dt>
              <dd className="mt-1 text-neutral-400">
                Yes. Use &quot;Regenerate plan&quot; from your plan page to go back through onboarding with your saved profile and get a new plan.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-surface-border py-20 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready for a plan that fits?
          </h2>
          <p className="mt-2 text-neutral-400">
            Get your personalized workout and nutrition plan in under a minute.
          </p>
          <Link href="/onboarding" className="mt-8 inline-block">
            <Button className="min-w-[200px] py-3 text-base">
              Find my plan
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-surface-border py-8 px-4 text-center text-sm text-neutral-500" role="contentinfo">
        GymBuddy AI — General guidance only. Consult a professional when in doubt.
      </footer>
      </main>
    </div>
  );
}
