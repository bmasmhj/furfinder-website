# The Fur Finder - Modern Next.js Application

A professional, production-ready Next.js application for reuniting lost pets with their families using AI-powered matching technology.

## Overview

The Fur Finder combines advanced machine learning with a compassionate community platform to help reunite lost pets with their owners. The application features:

- **AI-Powered Matching**: Advanced computer vision to match lost and found pets
- **Real-Time Notifications**: Instant alerts when potential matches are found
- **Direct Messaging**: Secure communication between community members
- **Location-Based Search**: Find pets near you using geolocation
- **Professional Dashboard**: Manage reports, matches, and messages in one place
- **SEO Optimized**: Full SSR support for better search engine visibility

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Components** - Reusable, accessible UI components

### Backend

- **Next.js API Routes** - RESTful API endpoints
- **Neon PostgreSQL** - Serverless database
- **JWT Authentication** - Secure token-based auth
- **bcryptjs** - Password hashing

### Architecture

- **App Router** - Modern file-based routing
- **Server Components** - Optimized rendering
- **Environment Variables** - Secure configuration
- **Middleware** - Route protection and verification

## Project Structure

```
the-fur-finder/
├── app/
│   ├── (marketing)/           # Public marketing pages
│   │   ├── page.tsx          # Landing page
│   │   ├── features/
│   │   ├── about/
│   │   ├── blog/
│   │   └── contact/
│   ├── (auth)/               # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (app)/                # Protected application pages
│   │   ├── dashboard/
│   │   ├── reports/
│   │   ├── matches/
│   │   ├── messages/
│   │   └── profile/
│   ├── api/v1/              # REST API endpoints
│   │   ├── auth/
│   │   ├── reports/
│   │   ├── matches/
│   │   ├── users/
│   │   ├── messages/
│   │   ├── conversations/
│   │   └── notifications/
│   ├── components/
│   │   ├── marketing/       # Header, Footer, etc.
│   │   ├── app/            # Dashboard components
│   │   └── common/         # Reusable UI components
│   ├── lib/
│   │   ├── db.ts           # Database connection
│   │   ├── auth.ts         # Authentication utilities
│   │   ├── types.ts        # TypeScript types
│   │   ├── validation.ts   # Zod schemas
│   │   ├── helpers.ts      # Utility functions
│   │   ├── constants.ts    # App constants
│   │   └── metadata.ts     # SEO metadata
│   ├── styles/
│   │   └── globals.css     # Global styles
│   ├── layout.tsx          # Root layout
│   └── middleware.ts       # Route protection
├── scripts/
│   └── schema.sql          # Database schema
├── public/                 # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── API.md                  # API documentation
├── DEPLOYMENT.md           # Deployment guide
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Neon PostgreSQL account

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/the-fur-finder.git
cd the-fur-finder
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```
DATABASE_URL=postgresql://user:password@host/pet_reunite
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NODE_ENV=development
```

4. **Run database migration**

```bash
npm run db:migrate
```

5. **Start development server**

```bash
npm run dev
```

Visit http://localhost:3000

## Key Features

### Marketing Pages

- **Landing Page**: Compelling hero section with CTAs
- **Features Page**: Detailed feature showcase
- **About Page**: Company story and team
- **Blog**: Success stories and pet care tips
- **Contact Page**: Support and inquiry forms

### Authentication

- **JWT-based Authentication**: Secure token system
- **Password Hashing**: bcryptjs for security
- **Protected Routes**: Middleware-based route protection
- **Token Verification**: Server-side token validation

### Application Pages

- **Dashboard**: Overview of active reports and matches
- **Reports Management**: Create, edit, and track pet reports
- **Match Matching**: AI-powered match suggestions
- **Messaging**: Direct communication between members
- **Profile Management**: User information and settings

### API Endpoints

- `/auth/*` - Authentication endpoints
- `/reports` - CRUD operations for reports
- `/matches` - Match management
- `/users/profile` - User profile management
- `/messages` - Messaging system
- `/conversations` - Conversation management
- `/notifications` - Notification handling

## Database Schema

The application uses the following main tables:

- **users** - User accounts and profiles
- **reports** - Lost/found pet reports
- **matches** - AI-matched report pairs
- **conversations** - Chat conversations
- **messages** - Chat messages
- **notifications** - User notifications

See `scripts/schema.sql` for complete schema details.

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint

# Database
npm run db:migrate  # Run database migrations
```

### Code Quality

- **TypeScript**: Full type coverage
- **Tailwind CSS**: Utility-first styling
- **Component Pattern**: Reusable, composable components
- **Environment Variables**: Secure configuration

## API Documentation

Full API documentation is available in [API.md](./API.md)

### Quick Example

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "display_name": "John Doe"
  }'

# Create a report
curl -X POST http://localhost:3000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "lost",
    "pet_type": "dog",
    "pet_name": "Max",
    "breed": "Golden Retriever",
    "color": "Golden",
    "description": "Missing near Central Park",
    "location_lat": 40.7829,
    "location_lon": -73.9654
  }'
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

```bash
vercel
```

### Environment Variables Required

- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NEXT_PUBLIC_API_URL` - API base URL

## Security

- JWT-based stateless authentication
- Password hashing with bcryptjs
- Database connection pooling
- Input validation with Zod
- CORS protection
- Middleware-based route protection
- Environment variable management

## Performance

- Server-side rendering for SEO
- Static page generation where possible
- Image optimization
- Code splitting
- Caching strategies

## SEO Optimization

- Dynamic metadata generation
- Open Graph support
- JSON-LD structured data
- Sitemap and robots.txt
- Mobile-responsive design

## Styling

The application uses Tailwind CSS v4 with:

- Brand color palette (teal-based)
- Neutral colors for backgrounds
- Semantic design tokens
- Responsive design system
- Dark mode support

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues, questions, or requests, use the path below:

- Product support, account help, and billing: `support@thefurfinder.com`
- Partnerships, directory onboarding, and advertising: `partnerships@thefurfinder.com`
- Privacy and data rights requests: `privacy@thefurfinder.com`

You can also start at the Contact page: `/contact`

## Roadmap

- [ ] Mobile app with React Native
- [ ] Advanced AI image recognition
- [ ] Veterinary partnerships
- [ ] Pet health tracking
- [ ] Community leaderboard
- [ ] Social media integration

## Acknowledgments

Built with modern web technologies to help reunite lost pets with their families.
