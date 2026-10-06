const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const configured = Boolean(url?.startsWith('https://') && key && !key.includes('YOUR_'));
async function request(path: string, options: RequestInit, token?: string) {
  if (!configured) throw new Error('Storage is not configured.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${url}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { apikey: key!, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    });
    if (!response.ok) throw new Error(`Request failed (${response.status}).`);
    return response.status === 204 || response.headers.get('content-length') === '0' ? null : await response.text();
  } finally { clearTimeout(timer); }
}
export async function saveResponse(id: string, answers: number[], program: string) {
  await request('/rest/v1/ai_study_profile_responses', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ id, q1: answers[0], q2: answers[1], q3: answers[2], q4: answers[3], q5: answers[4], program_area: program || null }),
  });
}
export async function instructorSignIn(email: string, password: string): Promise<string> {
  const text = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
  const session = JSON.parse(text!);
  if (!session.access_token) throw new Error('Unable to sign in.');
  return session.access_token;
}
export type Group = { category: string; count: number };
export type ProgramSummary = { program_area: string; count: number; average_score: number; profiles: Group[] };
export type Summary = { total_responses: number; average_score: number | null; profiles: Group[]; question_averages: (number | null)[]; programs: ProgramSummary[] };
export async function getSummary(token: string): Promise<Summary> {
  return JSON.parse((await request('/rest/v1/rpc/ai_study_profile_summary', { method: 'POST', body: '{}' }, token))!);
}
export async function instructorSignOut(token: string) {
  await request('/auth/v1/logout', { method: 'POST' }, token);
}
