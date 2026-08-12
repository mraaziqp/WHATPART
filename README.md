# WHATPART — South Africa's Premier Autoparts Marketplace

A consumer-facing B2C marketplace connecting South African car owners with 500+ verified auto parts suppliers, scrap yards, and OEM importers.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion (via `motion` package)
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── App.tsx              # Root SPA router
├── main.tsx             # Vite entry point
├── index.css            # Tailwind + global styles
├── app/                 # Page components
│   ├── page.tsx         # Storefront hero + catalog
│   ├── quote/page.tsx   # Quote request form
│   └── checkout/page.tsx # Checkout + payment
├── components/          # Reusable UI components
│   ├── Navbar.tsx       # Sticky nav with search
│   ├── Footer.tsx       # Trust pillars footer
│   ├── ProductGrid.tsx  # Filterable product catalog
│   ├── CartDrawer.tsx   # Slide-out cart
│   ├── GarageSearch.tsx # Vehicle/VIN/OEM search
│   └── Skeletons.tsx    # Loading states
├── data/
│   └── catalogData.ts   # Demo catalog seed data
├── store/
│   └── useStore.ts      # Zustand global state
└── utils/
    ├── formatters.ts    # ZAR currency, VIN, phone utils
    └── validationSchemas.ts # Zod form schemas
```

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The project auto-detects as a Vite app. No additional configuration needed.

## License

Proprietary — WHATPART (Pty) Ltd
