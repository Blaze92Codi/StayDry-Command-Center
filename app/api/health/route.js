import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY);

  return NextResponse.json({
    ok: true,
    service: 'StayDry Command Center',
    route: '/api/health',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    runtime: 'nodejs',
    nodeVersion: process.version,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
    anthropicConfigured: hasAnthropicKey,
    responseTimeMs: Date.now() - startedAt
  });
}
