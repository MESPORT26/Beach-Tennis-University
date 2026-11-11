# Beach Tennis University

Every beach tennis shot, when to play it, and where both players move, shown on animated top-down court diagrams.

It's a static website with no build step, server or database.

| File | What it is |
|---|---|
| `index.html` | Page structure |
| `styles.css` | Brand colours, layout, dark mode |
| `app.js` | Court drawing, animations, shots, scenarios, the "Which shot?" engine |
| `favicon.svg` | Browser-tab icon (the sunset logo) |

## Run it on your own computer

Double-click `index.html`, or for a proper local server run this in this folder:

    python3 -m http.server 8000

then open http://localhost:8000.

## Put it online (GitHub + Vercel, free)

1. Create a GitHub account at github.com and a new repository called `beach-tennis-university` (private or public).
2. Upload these files: on the new repo page, click "uploading an existing file", drag in the four files, and click Commit.
3. Go to vercel.com and sign up with your GitHub account.
4. Click Add New → Project and import `beach-tennis-university`. Leave every setting at its default (Framework: Other, no build command), then click Deploy.
5. About 30 seconds later the site is live at `beach-tennis-university.vercel.app` or similar.

Each time you change a file on GitHub, Vercel republishes the site automatically.

## Custom domain

1. Buy the domain from a registrar, for example VentraIP or Crazy Domains for `.com.au`, which needs an ABN, or Cloudflare or Namecheap for `.com`.
2. In Vercel, go to Project → Settings → Domains, add the domain, and copy the DNS records Vercel shows into your registrar.
3. Vercel adds HTTPS automatically.

## Editing content

Shots, scenarios and coaching text all live near the top of `app.js`:

- `SHOTS`: every shot, with its start positions, target, coaching text and player jobs.
- `SCENES`: the "When to play" scenarios, step by step, with the options after the serve.
- `choose()` and `target()`: the rules behind "Which shot?".

Court coordinates are in metres. x runs 0–16 with the net at 8, and your side is 0–8. y runs 0–8, with your left sideline at 0.
