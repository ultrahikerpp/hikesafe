import { NextResponse } from 'next/server';

import {
  routeSearchQuerySchema,
  searchRoutes,
} from '@/src/features/routes/catalog';

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const query = routeSearchQuerySchema.safeParse({
    q: url.searchParams.get('q') ?? undefined,
    region: url.searchParams.get('region') ?? undefined,
    kind: url.searchParams.get('kind') ?? undefined,
  });
  if (!query.success) {
    return NextResponse.json({ error: 'Invalid route query' }, { status: 400 });
  }

  return NextResponse.json({ routes: await searchRoutes(query.data) });
};
