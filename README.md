# StayDry Command V1

A simple Vercel-ready AI client response generator for StayDry Waterproofing.

## Local setup

1. Install Node.js
2. Open this folder in Terminal
3. Run:

```bash
npm install
```

4. Create `.env.local` (do not commit this file)
5. Configure your Claude API key and a random staff access token of at least 32 characters:

```bash
ANTHROPIC_API_KEY=your_key_here
STAYDRY_STAFF_ACCESS_TOKEN=your_random_staff_token
```

6. Run:

```bash
npm run dev
```

7. Open:

```bash
http://localhost:3000
```

## Vercel deployment

1. Upload this folder to GitHub
2. Go to Vercel
3. New Project
4. Import the GitHub repo
5. Add Environment Variable:

Name:
ANTHROPIC_API_KEY

Value:
your Claude API key

6. Add STAYDRY_STAFF_ACCESS_TOKEN as a private environment variable, using a random value of at least 32 characters. Distribute it only to authorized staff; enter it in the Staff Access Code field. Never put it in a public/client environment variable.
7. Deploy and verify /api/health returns 200. Missing staff configuration returns 503. See SECURITY.md for shared-credential and rate-limit limitations.
