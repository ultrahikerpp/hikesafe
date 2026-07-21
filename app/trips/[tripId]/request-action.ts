export const requestAction = async (url: string, body: unknown): Promise<{ ok: boolean }> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { ok: response.ok };
  } catch (error) {
    console.error('Trip action request failed', { url, error });
    return { ok: false };
  }
};
