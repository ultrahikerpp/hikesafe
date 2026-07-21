import Link from 'next/link';

import { LiffBootstrap } from '@/app/LiffBootstrap';
import { Card } from '@/app/components/Card';
import { Chip } from '@/app/components/Chip';
import { copy } from '@/src/features/i18n/copy';

export interface HomeActiveTrip {
  id: string;
  routeName: string;
  plannedFinishAt: string;
}

export function HomeContent({ activeTrip }: { activeTrip?: HomeActiveTrip }) {
  return <main>
    <Card>
      <h1>{copy.homeTitle}</h1>
      <p className="source-note">{copy.metadataDescription}</p>
      <LiffBootstrap />
      <p className="source-note">{copy.homeLoginInstructions}</p>
    </Card>
    {activeTrip
      ? <Card title={copy.activeTrip}>
          <div className="card-row">
            <span>{activeTrip.routeName}</span>
            <Chip tone="success">{copy.activeTrip}</Chip>
          </div>
          <p className="source-note">{copy.reportPlannedFinish(activeTrip.plannedFinishAt)}</p>
          <Link className="btn btn-primary" href={`/trips/${activeTrip.id}`}>{copy.goToTrip}</Link>
        </Card>
      : <p className="source-note">{copy.homeTripInstructions}</p>}
    <nav className="action-grid" aria-label={copy.primaryActions}>
      <a href="/trips/new">{copy.createTrip}</a>
      <a href="/trips/active">{copy.startHike}</a>
      <a href="/trips/active#check-in">{copy.progressReport}</a>
      <a href="/trips/active#finish">{copy.safeDown}</a>
      <a href="/guardians">{copy.myGuardians}</a>
    </nav>
    <p className="source-note" aria-label={copy.alertLegendLabel}>{copy.alertLegend}</p>
  </main>;
}
