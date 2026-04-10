const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined in your environment variables.');
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  return fetch(url, init);
}
