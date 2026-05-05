import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

function clean(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value).trim() || fallback;
}

function pick(body, keys, fallback = '') {
  for (const key of keys) {
    if (body && body[key] !== undefined && body[key] !== null && String(body[key]).trim() !== '') {
      return String(body[key]).trim();
    }
  }
  return fallback;
}

function buildPrompt(body = {}) {
  const clientName = pick(body, ['CLIENT_NAME', 'clientName', 'client_name', 'name'], 'the homeowner');
  const propertyIssue = pick(body, ['PROPERTY_ISSUE', 'propertyIssue', 'property_issue', 'issue'], 'waterproofing concern');
  const fieldNotes = pick(body, ['FIELD_NOTES', 'fieldNotes', 'field_notes', 'notes'], 'No field notes provided.');

  return `Create a StayDry waterproofing client response using this information:\n\nCLIENT_NAME: ${clientName}\nPROPERTY_ISSUE: ${propertyIssue}\nFIELD_NOTES: ${fieldNotes}\n\nAlways produce:\n\n1. Situation Summary\n2. Observed Issues\n3. Risk / Impact\n4. Recommended Evaluation or Scope\n5. Client-Facing Message\n- Keep under 120–150 words\n- Clear, direct, and easy to read\n- Strong but professional call-to-action\n- Avoid technical overload\n6. Sales Positioning Statement\n- Short, 2–4 sentences max\n- Focus on trust, clarity, and correct execution\n- Written as a value statement, not internal notes\n7. Follow-Up Questions\n- Keep concise and relevant\n- Focus only on what helps scheduling or evaluation`;
}

function fallbackResponse(body = {}) {
  const clientName = pick(body, ['CLIENT_NAME', 'clientName', 'client_name', 'name'], 'the homeowner');
  const propertyIssue = pick(body, ['PROPERTY_ISSUE', 'propertyIssue', 'property_issue', 'issue'], 'water intrusion concern');
  const fieldNotes = pick(body, ['FIELD_NOTES', 'fieldNotes', 'field_notes', 'notes'], 'Field notes were not provided.');

  return `1. Situation Summary\n${clientName} is reporting a waterproofing concern involving ${propertyIssue}. The available notes indicate the issue should be reviewed before assuming the cause or final repair scope.\n\n2. Observed Issues\n${fieldNotes}\n\n3. Risk / Impact\nUnresolved water entry can create repeat moisture exposure, pump strain, interior damage, and customer frustration if the root cause is not confirmed.\n\n4. Recommended Evaluation or Scope\nStayDry should complete an on-site evaluation, confirm the source of water entry, inspect the sump/drainage conditions, and provide a clear corrective scope.\n\n5. Client-Facing Message\nThank you for sharing the concern. Based on the information provided, the best next step is a professional StayDry evaluation so we can verify the source, confirm what is functioning properly, and provide the right repair recommendation. We want to make sure this is addressed correctly, not guessed at.\n\n6. Sales Positioning Statement\nStayDry’s value is in giving the homeowner a clear answer and a properly scoped solution. This protects trust, avoids unnecessary work, and keeps the project focused on correct execution.\n\n7. Follow-Up Questions\n- When did the issue first appear?\n- Is water entering during rain, snow melt, or continuously?\n- Is the sump pump currently operating?\n- What is the best time to schedule an evaluation?`;
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ ok: true, route: '/api/generate', model: MODEL });
}

export async function POST(request) {
  let body = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const prompt = buildPrompt(body);
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    const output = fallbackResponse(body);
    return NextResponse.json({
      ok: true,
      source: 'fallback-no-api-key',
      output,
      text: output,
      response: output,
      content: output
    });
  }

  try {
    const anthropicResponse = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 900,
        temperature: 0.25,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await anthropicResponse.json().catch(() => ({}));

    if (!anthropicResponse.ok) {
      const output = fallbackResponse(body);
      return NextResponse.json({
        ok: true,
        source: 'fallback-anthropic-error',
        anthropicStatus: anthropicResponse.status,
        anthropicError: data?.error?.message || 'Anthropic request failed.',
        output,
        text: output,
        response: output,
        content: output
      });
    }

    const output = clean(data?.content?.map((part) => part?.text || '').join('\n'), fallbackResponse(body));

    return NextResponse.json({
      ok: true,
      source: 'anthropic',
      output,
      text: output,
      response: output,
      content: output
    });
  } catch (error) {
    const output = fallbackResponse(body);
    return NextResponse.json({
      ok: true,
      source: 'fallback-runtime-error',
      error: error?.message || 'Runtime error handled safely.',
      output,
      text: output,
      response: output,
      content: output
    });
  }
}
