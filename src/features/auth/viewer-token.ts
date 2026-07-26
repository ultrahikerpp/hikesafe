export const viewerGrantHeader = 'x-hikesafe-viewer-grant';

export const viewerTokenFromRequest = (request: Request) => request.headers.get(viewerGrantHeader) ?? undefined;
