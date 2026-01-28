# Nursery Portal - Modern SaaS Frontend

A beautiful, professionally-designed staff portal for nursery employees with a modern SaaS aesthetic, featuring #da6220 corporate orange branding, comprehensive admin panel, and smooth interactions.

## 🎉 What We Built

This is a full-stack Next.js application with:
- **Beautiful frontend** for nursery staff to access resources
- **Powerful admin panel** for content management
- **Supabase backend** with PostgreSQL database and file storage
- **Modern design system** with Tailwind CSS and custom components
- **Responsive design** that works on mobile, tablet, and desktop

---

## 🚀 Tech Stack

- **Framework**: Next.js 16.1.4 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for file uploads)
- **UI Components**: Custom components with shadcn/ui patterns
- **Icons**: Lucide React
- **Rich Text Editor**: Tiptap
- **Image Upload**: Custom image upload component

---

## ✨ Features

### Frontend (Staff Portal)

#### 1. **Home/Dashboard** (`/`)
- Hero section with gradient background (#da6220)
- 3x3 grid of quick access cards
- Links to all main sections
- Hover effects and smooth animations

#### 2. **Company Updates** (`/updates`)
- Featured update card with border highlighting
- Grid of recent updates (2 columns)
- Date formatting (e.g., "22 January 2026")
- Excerpt extraction from HTML content
- "Read more" links

#### 3. **Policies & Procedures** (`/policies`)
- File download page with **big 48x48px icons**
- Colored backgrounds per file type:
  - PDF: Red
  - Word: Blue
  - Excel: Green
  - PowerPoint: Orange
- File size display
- Download functionality from Supabase Storage

#### 4. **Employee Handbooks** (`/handbooks`)
- Same design as Policies page
- Separate storage bucket
- Big icons and smooth hover effects

#### 5. **Training & Development** (`/training`)
- **Two-column layout**: Content on left, files on right
- Rich text content area
- Training materials with file cards
- Downloads from training storage bucket

#### 6. **Wellbeing Hub** (`/wellbeing`)
- Rich text content section
- **Image gallery** with hover overlays
- Download buttons appear on hover
- Lazy loading for images
- Aspect ratio maintained (16:9)

#### 7. **HR Library** (`/hr-library`)
- **Collapsible sections** with smooth animations
- Files organized by category
- File count badges
- Chevron icons (down when open, right when closed)
- Download buttons for each file

#### 8. **Job Vacancies** (`/vacancies`)
- **Hero search bar** with 3 filters:
  - Nursery dropdown
  - Job title search
  - Postcode search
- **Distance calculation**:
  - Geocodes user's postcode
  - Calculates distance to each nursery
  - Displays "X miles away"
- Job cards (2 columns on desktop)
- Empty state with helpful message
- "Clear filters" button

#### 9. **Employee Benefits** (`/benefits`)
- Clean single-column layout
- Rich text content
- Simple and focused design

### Admin Panel

All admin pages located at `/admin/*`:

#### 1. **Company Updates** (`/admin/company-updates`)
- Create, edit, delete updates
- Rich text editor (Tiptap)
- Published date tracking
- List view of all updates

#### 2. **Policies** (`/admin/policies`)
- Upload PDF, DOC, DOCX files
- File metadata stored in database
- Download and delete functionality
- File size tracking

#### 3. **Handbooks** (`/admin/handbooks`)
- Same functionality as Policies
- Separate storage bucket

#### 4. **Wellbeing Hub** (`/admin/wellbeing-hub`)
- Rich text editor for content
- Image gallery management
- Upload multiple images
- Delete images
- Preview images

#### 5. **Training** (`/admin/training`)
- Rich text editor for content
- File upload for training materials
- Supports multiple file types

#### 6. **Benefits** (`/admin/benefits`)
- Simple rich text editor
- Single content area
- Auto-saves

#### 7. **HR Library** (`/admin/hr-library`)
- Create sections (categories)
- Upload files to sections
- Reorder sections
- Edit section titles
- Delete sections and files

#### 8. **Vacancies** (`/admin/vacancies`)
- **CSV upload for nurseries**:
  - Columns: nursery_name, address, town, county, postcode, phone, group
  - Automatically geocodes postcodes (lat/lon)
  - Uses postcodes.io API
- **CSV upload for jobs**:
  - Columns: nursery_name, nursery_location, postcode, job_title, hours, status
  - Links jobs to nurseries
- Download current data as CSV
- Delete all data functionality
- Preview data (shows first 10)

#### 9. **iCare Companion** (`/admin/icare-companion`)
- Configuration for AI chat integration
- API key management
- Welcome message customization

---

## 🎨 Design System

### Color Palette

**Primary (Corporate Orange):**
```javascript
primary: {
  50: '#fef7f0',
  100: '#fde9d8',
  200: '#fbd1b0',
  300: '#f8b388',
  400: '#f19560',
  500: '#da6220', // Main brand color
  600: '#b8511a',
  700: '#964014',
  800: '#74300f',
  900: '#52200a'
}
```

**Supporting Colors:** Tailwind's default slate grays

### Typography
- **Font**: Inter (via Google Fonts)
- **Headings**: Bold, various sizes (text-5xl to text-xl)
- **Body**: text-base with system font fallbacks
- **Line height**: Relaxed for readability

### Components

#### Card Component
Variants:
- `default`: Shadow + hover effect
- `elevated`: Stronger shadow
- `flat`: Border only
- `interactive`: Scale on hover + shadow

#### FileCard Component
- **48x48px colored icons**
- File type detection
- File size display
- Full-width download button
- Hover effects (scale + shadow)

#### Badge Component
Variants: default, primary, secondary, success, warning, error, info, outline

#### Button Component
- **Primary variant**: Uses #da6220
- Active state: scale-95
- Hover effects
- Multiple sizes

### Animations & Interactions

- **Card hover**: scale-102 + shadow-md
- **Button click**: scale-95
- **Collapsible sections**: Smooth height/opacity transitions
- **Image gallery**: Scale on hover + overlay
- **Navigation tabs**: Active state with background
- **Loading states**: Skeleton loaders and spinners

---

## 📁 File Structure

```
nursery-portal/
├── app/
│   ├── (frontend)/           # Public-facing portal
│   │   ├── layout.tsx        # Frontend layout (Header + Navigation)
│   │   ├── page.tsx          # Home/Dashboard
│   │   ├── benefits/
│   │   ├── handbooks/
│   │   ├── hr-library/
│   │   ├── policies/
│   │   ├── training/
│   │   ├── updates/
│   │   ├── vacancies/
│   │   └── wellbeing/
│   ├── admin/                # Admin panel
│   │   ├── benefits/
│   │   ├── company-updates/
│   │   ├── handbooks/
│   │   ├── hr-library/
│   │   ├── icare-companion/
│   │   ├── policies/
│   │   ├── training/
│   │   ├── vacancies/
│   │   └── wellbeing-hub/
│   ├── globals.css
│   └── layout.tsx            # Root layout
├── components/
│   ├── layout/
│   │   ├── header.tsx        # Logo + iCare button
│   │   └── navigation.tsx    # Horizontal tab navigation
│   ├── ui/
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── file-card.tsx     # Big icon file cards
│   │   └── input.tsx
│   ├── chat-bubble.tsx       # iCare chat widget
│   ├── chat-provider.tsx
│   ├── file-upload.tsx
│   ├── image-upload.tsx
│   └── rich-text-editor.tsx
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── utils.ts
├── tailwind.config.ts        # Custom colors + fonts
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

### Tables

#### `company_updates`
- `id` (uuid, primary key)
- `title` (text)
- `content` (text, HTML)
- `published_at` (timestamp)
- `updated_at` (timestamp)

#### `benefits_content`
- `id` (uuid, primary key)
- `content` (text, HTML)
- `updated_at` (timestamp)

#### `training_content`
- `id` (uuid, primary key)
- `content` (text, HTML)
- `updated_at` (timestamp)

#### `wellbeing_content`
- `id` (uuid, primary key)
- `content` (text, HTML)
- `updated_at` (timestamp)

#### `policies`
- `id` (uuid, primary key)
- `filename` (text)
- `file_path` (text)
- `file_size` (bigint)
- `file_type` (text)
- `uploaded_at` (timestamp)

#### `handbooks`
Same structure as `policies`

#### `training_files`
Same structure as `policies`

#### `wellbeing_images`
- `id` (uuid, primary key)
- `filename` (text)
- `file_path` (text)
- `file_size` (bigint)
- `file_type` (text)
- `uploaded_at` (timestamp)

#### `hr_library_sections`
- `id` (uuid, primary key)
- `title` (text)
- `display_order` (integer)
- `created_at` (timestamp)

#### `hr_library_files`
- `id` (uuid, primary key)
- `section_id` (uuid, foreign key)
- `filename` (text)
- `file_path` (text)
- `file_size` (bigint)
- `file_type` (text)
- `display_order` (integer)
- `uploaded_at` (timestamp)

#### `nurseries`
- `id` (uuid, primary key)
- `nursery_name` (text)
- `address` (text)
- `town` (text)
- `county` (text)
- `postcode` (text)
- `phone` (text)
- `nursery_group` (text)
- `latitude` (numeric)
- `longitude` (numeric)

#### `jobs`
- `id` (uuid, primary key)
- `nursery_id` (uuid, foreign key, nullable)
- `nursery_name` (text)
- `nursery_location` (text)
- `postcode` (text)
- `job_title` (text)
- `hours` (text)
- `status` (text, default: 'active')

### Storage Buckets

- `policies` - Policy documents
- `handbooks` - Employee handbooks
- `training` - Training materials
- `wellbeing` - Wellbeing hub images
- `hr-library` - HR library files

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account with project created
- Environment variables configured

### Installation

1. **Clone the repository**
```bash
cd nursery-portal
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase**
- Create all tables (see Database Schema above)
- Create storage buckets with public access:
  - policies
  - handbooks
  - training
  - wellbeing
  - hr-library

5. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

6. **Build for production**
```bash
npm run build
npm start
```

---

## 📝 How to Use

### For Admins

1. **Go to admin panel**: `http://localhost:3000/admin/[section]`
2. **Add content**:
   - Use rich text editors for formatted content
   - Upload files (PDF, Word, Excel, PowerPoint, images)
   - Create sections and organize files
3. **Manage vacancies**:
   - Upload nurseries CSV first (to establish locations)
   - Upload jobs CSV (will link to nurseries)
   - Download current data for backup

### For Staff Members

1. **Visit portal**: `http://localhost:3000`
2. **Navigate** using top tabs or quick links
3. **Download files** by clicking the download button
4. **Search jobs** by nursery, title, or postcode
5. **View images** in wellbeing gallery

---

## 🎯 Key Features Implemented

✅ Modern SaaS design aesthetic
✅ Corporate #da6220 orange throughout
✅ Big 48x48px icons for file downloads
✅ Smooth hover effects and transitions
✅ Responsive design (mobile, tablet, desktop)
✅ File uploads with Supabase Storage
✅ Rich text editing with Tiptap
✅ CSV upload for bulk data import
✅ Geocoding with postcodes.io API
✅ Distance calculation for job search
✅ Collapsible sections with animations
✅ Image gallery with download functionality
✅ Loading states and empty states
✅ iCare chat bubble placeholder

---

## 🔮 Future Enhancements

### Next Session Ideas:

1. **More Frontend Polish**
   - Add page transitions
   - Implement "Read full article" pages for updates
   - Add breadcrumbs for navigation
   - Create a search bar for global content search

2. **User Authentication**
   - Login/logout functionality
   - Role-based access (admin vs staff)
   - Protected routes

3. **Advanced Features**
   - Bookmarking favorite resources
   - Comments on company updates
   - Notifications for new content
   - Analytics dashboard for admins

4. **Mobile App**
   - Progressive Web App (PWA)
   - Push notifications
   - Offline mode

5. **iCare Integration**
   - Connect chat bubble to actual AI backend
   - Context-aware responses
   - File search integration

---

## 🏗️ Technical Highlights

### Performance
- Server-side rendering for fast initial load
- Static generation where possible
- Lazy loading for images
- Optimized bundle size

### Code Quality
- TypeScript for type safety
- Consistent component patterns
- Reusable utility functions
- Clean file organization

### Accessibility
- Semantic HTML
- Keyboard navigation support
- ARIA labels where needed
- Color contrast compliance (WCAG AA)

### Security
- Environment variables for sensitive data
- Supabase Row Level Security (RLS) ready
- File type validation on uploads
- XSS protection with proper HTML sanitization

---

## 📦 Dependencies

### Main Dependencies
- `next`: 16.1.4
- `react`: 19.0.0
- `@supabase/supabase-js`: Latest
- `tailwindcss`: Latest
- `lucide-react`: Latest (icons)
- `@tiptap/react`: Latest (rich text editor)
- `class-variance-authority`: Latest (component variants)

### Dev Dependencies
- `typescript`: Latest
- `@types/node`: Latest
- `@types/react`: Latest

---

## 🎨 Design Inspiration

The design draws inspiration from:
- **Notion**: Clean cards, subtle shadows
- **Linear**: Smooth animations, modern feel
- **Stripe**: Bold typography, confident colors
- **Vercel**: Minimalist, fast-feeling UI

---

## 🤝 Contributing

This is a custom project. For questions or improvements:
1. Review the code structure
2. Follow existing patterns
3. Test thoroughly before deploying
4. Update this README with any changes

---

## 📄 License

Private project - All rights reserved

---

## 🙏 Acknowledgments

Built with:
- Next.js team for the amazing framework
- Supabase for backend infrastructure
- Tailwind CSS for styling system
- Vercel for deployment platform

---

**Built with ❤️ for iSTEP Nurseries**

*Last updated: January 2026*
