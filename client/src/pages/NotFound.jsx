import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <section className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <Seo title="Page not found | Hindupur Scrap Hub" description="This page does not exist." />
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-ink-100 text-ink-500 dark:bg-ink-800">
          <Compass className="h-10 w-10" />
        </span>
        <h1 className="mt-6 font-display text-5xl font-extrabold text-ink-950 dark:text-white">404</h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          This page went to the scrap yard.
        </p>
        <Link to="/" className="btn-primary mt-6">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </section>
  );
}
