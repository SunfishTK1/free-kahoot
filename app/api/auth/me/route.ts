import { getCurrentUser } from '@/src/lib/auth';
import { json, error } from '@/src/server/api/responses';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return error('Unauthorized', 401);
  return json({ id: user.id, email: user.email, name: user.name, planType: user.planType });
}
