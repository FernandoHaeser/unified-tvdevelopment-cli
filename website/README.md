# tvdev Landing Page

Marketing site for [tvdev-cli](https://github.com/tvdev-cli/tvdev-cli), deployed to GitHub Pages from the `main` branch via the `website/` directory.

**Live:** https://tvdev-cli.github.io/

---

## Stack

- **Next.js 14** — static export (`output: 'export'`)
- **Tailwind CSS 3**
- **TypeScript**

## Local development

```bash
cd website
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
cd website
npm run build
```

Outputs to `website/out/`. No `basePath` — configured for root URL `https://tvdev-cli.github.io/`.

## Deploy

Push to `main` with changes inside `website/`. The workflow at `.github/workflows/pages.yml` builds and deploys automatically.

## Structure

```
website/
  app/
    layout.tsx       # Root layout, metadata, global CSS
    page.tsx         # Page composition — section order lives here
  components/
    InstallHero.tsx  # Hero section: install commands, OS tabs, beta toggle
    Hero.tsx         # Product tagline + description
    Nav.tsx          # Top navigation bar
    Stats.tsx        # Key stats strip (4 platforms, MIT, etc.)
    PlatformTabs.tsx # Per-platform feature tabs (webOS, Tizen, Fire TV, AndroidTV)
    Features.tsx     # Feature grid
    CTA.tsx          # Bottom call-to-action
    Footer.tsx       # Footer
    icons.tsx        # Shared SVG icons
  public/
    favicon.svg
```

## Adding a section

1. Create `website/components/MySection.tsx`
2. Import and place it in `website/app/page.tsx`

## License

MIT
