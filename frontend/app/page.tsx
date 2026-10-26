import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingSections } from "@/components/landing/landing-sections";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const signedIn = (await getSession()) !== null;

  return (
    <div className="min-h-screen bg-canvas">
      <LandingNav signedIn={signedIn} />
      <main>
        <LandingHero signedIn={signedIn} />
        <LandingSections signedIn={signedIn} />
      </main>
      <LandingFooter />
    </div>
  );
}
