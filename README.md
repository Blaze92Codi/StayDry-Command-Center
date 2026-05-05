# StayDry Command V1

A simple Vercel-ready AI client response generator for StayDry Waterproofing.

## Local setup

1. Install Node.js
2. Open this folder in Terminal
3. Run:

```bash
npm install
```

4. Rename `.env.local.example` to `.env.local`
5. Paste your Claude API key:

```bash
ANTHROPIC_API_KEY=your_key_here
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

6. Deploy
