import { LiffBootstrap } from './LiffBootstrap';
import { copy } from '@/src/features/i18n/copy';

export default function Home() {
  return <main>
    <h1>{copy.homeTitle}</h1>
    <LiffBootstrap />
    <p>{copy.homeLoginInstructions}</p>
    <nav aria-label={copy.primaryActions}>
      <a href="/trips/new">{copy.createTrip}</a>
      <a href="/trips/active">{copy.startHike}</a>
      <a href="/trips/active#check-in">{copy.progressReport}</a>
      <a href="/trips/active#finish">{copy.safeDown}</a>
    </nav>
    <p>{copy.homeTripInstructions}</p>
    <p aria-label={copy.alertLegendLabel}>{copy.alertLegend}</p>
  </main>;
}
