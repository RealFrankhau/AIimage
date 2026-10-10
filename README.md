# AI Gen Library

A private, self-hosted AI Generation Gallery & Prompt Library built with Next.js 14, Supabase, and Tailwind CSS. Designed for personal use to store, organize, and search AI-generated images with their complete prompts.

![AI Gen Library](https://via.placeholder.com/800x450/3533%2097%/FFFFFF?text=AI+Gen+Library)

## Features

- 🔐 **Private & Secure** - Single-user access with Supabase Auth, Row Level Security, and private storage
- 🖼️ **Image Management** - Upload, view, organize, and download AI-generated images
- 📝 **Prompt Library** - Store complete prompts, negative prompts, and generation parameters
- 🔍 **Advanced Search** - Search by title, prompt, negative prompt, tags, category, AI tool, style
- ⭐ **Favorites** - Mark and filter favorite works
- 🏷️ **Categories & Tags** - Customizable categorization system
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ♿ **Accessible** - Keyboard navigation, focus states, semantic HTML
- 🎨 **Minimalist Design** - Japanese editorial-inspired aesthetic

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Authentication**: Supabase Auth (SSR)
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (private bucket)
- **Deployment**: Vercel
- **Forms**: React Hook Form + Zod
- **State**: Zustand (client), Server Actions (server)
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+
- npm/pnpm/yarn
- Supabase account
- Vercel account (for deployment)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai-gen-library
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project
2. Go to Settings → API and copy:
   - Project URL
   - Anon (public) key
   - Service role key (keep secret!)

3. Run the database migration:
   - Go to SQL Editor in Supabase Dashboard
   - Copy and run the contents of `supabase/migrations/001_initial_schema.sql`

4. Set up Storage:
   - Follow instructions in `STORAGE_SETUP.md`

5. Configure Auth:
   - Follow instructions in `SUPABASE_AUTH_SETUP.md`

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
ALLOWED_EMAIL=your-email@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx          # Login page
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx      # Main gallery
│   │   ├── work/
│   │   │   ├── [id]/page.tsx       # Work detail
│   │   │   ├── [id]/edit/page.tsx  # Edit work
│   │   │   └── new/page.tsx        # New work
│   │   └── settings/page.tsx       # Settings
│   ├── api/
│   │   ├── auth/callback/route.ts  # Auth callback
│   │   └── image/route.ts          # Image proxy
│   ├── actions/
│   │   ├── auth.ts                 # Auth server actions
│   │   ├── works.ts                # Works server actions
│   │   └── categories.ts           # Categories server actions
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home (redirects)
│   └── globals.css                 # Global styles
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── layout/
│   │   ├── Header.tsx              # Top navigation
│   │   ├── Sidebar.tsx             # Side navigation
│   │   ├── DashboardLayout.tsx     # Dashboard wrapper
│   │   └── AuthLayout.tsx          # Auth pages wrapper
│   └── work/
│       ├── WorkCard.tsx            # Work card component
│       ├── WorkGrid.tsx            # Grid/List view
│       ├── WorkForm.tsx            # Add/Edit form
│       └── ImageUpload.tsx         # Drag-drop upload
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   └── server.ts               # Server client
│   ├── queries.ts                  # Database queries
│   └── storage.ts                  # Storage helpers
├── hooks/                          # Custom React hooks
├── types/                          # TypeScript types
└── utils/                          # Utility functions
```

## Database Schema

### works
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `title` (TEXT)
- `prompt` (TEXT)
- `negative_prompt` (TEXT, nullable)
- `image_path` (TEXT)
- `ai_tool` (TEXT, nullable)
- `model_name` (TEXT, nullable)
- `style` (TEXT, nullable)
- `category_id` (UUID, FK → categories, nullable)
- `tags` (TEXT[])
- `image_width` (INTEGER, nullable)
- `image_height` (INTEGER, nullable)
- `aspect_ratio` (TEXT, nullable)
- `seed` (TEXT, nullable)
- `parameters` (JSONB, nullable)
- `notes` (TEXT, nullable)
- `is_favorite` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### categories
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `name` (TEXT)
- `created_at` (TIMESTAMPTZ)

## Security

- **Server-side auth validation** on all protected routes
- **Row Level Security** on all database tables
- **Private storage bucket** with user-scoped policies
- **Signed URLs** for image access (1-hour expiry)
- **No public registration** - only `ALLOWED_EMAIL` can access
- **Middleware protection** for all dashboard routes
- **Service role key** only used server-side for storage operations

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ALLOWED_EMAIL`
   - `NEXT_PUBLIC_SITE_URL` (your Vercel URL)
4. Deploy

### Environment Variables by Environment

**Production:**
- All variables above with production URLs

**Preview:**
- Same as production but with preview URL for `NEXT_PUBLIC_SITE_URL`

**Development:**
- Local values in `.env.local`

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript check
```

## Customization

### Default Categories

Edit `src/components/work/WorkForm.tsx` to modify default AI tools and styles.

### Design System

Modify `tailwind.config.ts` and `src/app/globals.css` for colors, fonts, spacing.

### Default AI Tools/Styles

```typescript
// In WorkForm.tsx
const DEFAULT_AI_TOOLS = ['Midjourney', 'DALL-E 3', 'Stable Diffusion', ...];
const DEFAULT_STYLES = ['Photorealistic', 'Illustration', 'Oil Painting', ...];
```

## License

MIT License - Feel free to use for personal projects.

## Contributing

This is a personal project, but suggestions and issues are welcome!

## Support

If you encounter issues:
1. Check the setup guides in `STORAGE_SETUP.md` and `SUPABASE_AUTH_SETUP.md`
2. Verify all environment variables are set correctly
3. Check Supabase logs for auth/storage errors
4. Ensure RLS policies are applied correctly