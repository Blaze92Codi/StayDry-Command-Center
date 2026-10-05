import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY);

  const staffConfigured = (process.env.STAYDRY_STAFF_ACCESS_TOKEN?.length ?? 0) >= 32;
  return NextResponse.json({
    ok: staffConfigured,
    service: 'StayDry Command Center',
    route: '/api/health',
    status: staffConfigured ? 'healthy' : 'unavailable',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    runtime: 'nodejs',
    nodeVersion: process.version,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
    anthropicConfigured: hasAnthropicKey,
    staffAccessConfigured: staffConfigured,
    responseTimeMs: Date.now() - startedAt
  }, { status: staffConfigured ? 200 : 503 });
}
