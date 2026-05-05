import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function POST(req) {
  try {
    const { clientName, propertyIssue, fieldNotes } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "Missing ANTHROPIC_API_KEY in Vercel environment variables." },
        { status: 500 }
      );
    }

    const prompt = `
Create a StayDry waterproofing client response using this information:

CLIENT_NAME: ${clientName || "Not provided"}
PROPERTY_ISSUE: ${propertyIssue || "Not provided"}
FIELD_NOTES: ${fieldNotes || "Not provided"}

Always produce:

1. Situation Summary
2. Observed Issues
3. Risk / Impact
4. Recommended Evaluation or Scope
5. Client-Facing Message
- Keep under 120–150 words
- Clear, direct, and easy to read
- Strong but professional call-to-action
- Avoid technical overload
6. Sales Positioning Statement
- Short, 2–4 sentences max
- Focus on trust, clarity, and correct execution
- Written as a value statement, not internal notes
7. Follow-Up Questions
- Keep concise and relevant
- Focus only on what helps scheduling or evaluation
`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    });

    return Response.json({ response: message.content[0].text });
  } catch (error) {
    return Response.json(
      { error: error.message || "Failed to generate response." },
      { status: 500 }
    );
  }
}
