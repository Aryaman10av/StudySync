import { ArrowDownRight, ArrowUpRight, BookOpenCheck, CalendarDays, Check, Clock3, Target } from "lucide-react";
import { Link } from "react-router-dom";
import SiteHeader from "../../components/layout/SiteHeader.jsx";

const benefits = [
  {
    icon: CalendarDays,
    title: "Deadlines, in their place",
    description: "See what is due next and give every assignment a clear place in your week.",
  },
  {
    icon: Target,
    title: "One thing at a time",
    description: "Turn a long list into a focused session, then keep a record of the work you put in.",
  },
  {
    icon: Clock3,
    title: "Progress you can feel",
    description: "Notice your study rhythm over time without turning your day into another scoreboard.",
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section aria-labelledby="hero-title" className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> A steadier way to study</span>
            <h1 id="hero-title">Make room for your <em>best work.</em></h1>
            <p className="hero-description">
              A calmer place for classes, deadlines, and focused study. Get the whole week out of your head and into a plan you can actually follow.
            </p>
            <div className="hero-buttons">
              <Link className="button button-primary" to="/register">
                Build your study plan <ArrowUpRight aria-hidden="true" />
              </Link>
              <a className="button button-outline" href="#why-studysync">
                Take a look <ArrowDownRight aria-hidden="true" />
              </a>
            </div>
            <div className="hero-note"><Check aria-hidden="true" /> Your studies, organized around you</div>
          </div>
          <div className="hero-visual" aria-label="A student planning a study session">
            <div className="hero-photo-wrap">
              <img
                alt="Student writing in a notebook at a sunlit desk"
                className="hero-photo"
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1100&q=85"
              />
              <div className="photo-label">A little more focus.<br />A lot less juggling.</div>
            </div>
            <div className="plan-note" aria-label="Study plan preview">
              <div className="plan-note-top"><span>THIS WEEK</span><BookOpenCheck aria-hidden="true" /></div>
              <strong>Find your rhythm</strong>
              <div className="plan-progress"><span /></div>
              <span className="progress-copy">A plan that moves with you</span>
            </div>
            <div className="visual-stamp"><span>Small steps<br />add up</span></div>
          </div>
        </section>
        <div className="section-rule" />
        <section aria-labelledby="benefits-title" className="benefits" id="why-studysync">
          <div className="benefits-heading">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" /> Less scattered, more steady</span>
              <h2 id="benefits-title">Your semester has a lot going on. Your planner can feel simple.</h2>
            </div>
            <p id="how-it-helps">Bring subjects, work, and study time together. Spend less energy keeping track, and more on the next thing that matters.</p>
          </div>
          <div className="benefit-list">
            {benefits.map(({ description, icon: Icon, title }) => (
              <article className="benefit" key={title}>
                <span className="benefit-icon"><Icon aria-hidden="true" size={19} /></span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <Link aria-label="StudySync home" className="brand" to="/">
          <span className="brand-mark"><BookOpenCheck aria-hidden="true" /></span>
          <span>studysync</span>
        </Link>
        <span>Make time for what matters.</span>
      </footer>
    </>
  );
}