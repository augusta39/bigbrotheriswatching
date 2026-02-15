# 👻 GhostBell

A non-confrontational, playful "house ops" notification system for roommates.

## What is GhostBell?

GhostBell is a **completely anonymous**, QR-first web app for household notifications. Print one QR code, post it anywhere in your home (laundry room, kitchen, etc.), and anyone can scan it to instantly send or respond to notifications about shared resources—no signup, no names, zero confrontation.

## Core Features

- **One QR Code**: Print and post a single QR code for your entire household
- **Fully Anonymous**: No names, no accounts, no personal info required
- **Instant Access**: Scan QR → immediately send or view notifications
- **Playful Narrators**: Choose from Ghost, Space Station, House Fairy, or Neutral System personas
- **Emoji Reactions Only**: Respond with 👋 🫡 🚫 🙏 instead of typing
- **Real-time Updates**: Automatic polling keeps everyone in sync (5-second intervals)
- **Mobile-First**: Clean, minimal design optimized for phones

## Tech Stack

- **Next.js 15** (App Router) with TypeScript
- **TailwindCSS** for styling
- **Prisma ORM** with SQLite (Postgres-ready)
- **QR Code Generation** with qrcode library
- **Polling-based real-time** (5-second intervals, SSE-ready architecture)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ghostbell
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# Seed the database with demo data
npx prisma db seed
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to [http://localhost:3000](http://localhost:3000)

## Demo Data

The seed script creates:
- **Household**: "Apartment 404"
- **Anonymous member** for testing
- **One open blast** for the dryer

After seeding, the script will output:
- Bell URL: `http://localhost:3000/bell/[householdId]`
- QR Code URL: `http://localhost:3000/qr/[householdId]`

## Usage

### Setting Up Your Household

1. Run the seed script (see Installation above)
2. Visit the QR Code URL shown in the seed output
3. Print the QR code and post it around your home (laundry room, kitchen, etc.)
4. Done! Anyone can now scan and use it

### Using GhostBell

**Scan the QR code** → Opens the bell page automatically

**On the bell page, you can:**
1. **Ring the bell**: Tap "Ring GhostBell" → Choose resource → Select urgency → Send
2. **View active notifications**: See what needs attention
3. **React to notifications**:
   - 👋 **Mine** - Claim ownership
   - 🫡 **On it** - Soft claim
   - 🚫 **Not me** - Dismiss
   - 🙏 **Acknowledged** - Simple acknowledgment
4. **Mark done**: Once you've claimed a notification, mark it complete

### Anonymous by Default

- **No signup required**: Just scan and use
- **No names shown**: All interactions are anonymous
- **One QR per household**: Everyone uses the same QR code
- **Privacy-first**: No tracking, no accounts, no personal data

### Getting Your QR Code

Visit `/qr/[householdId]` to view and print your household's QR code. The householdId is shown in the seed script output.

## Project Structure

```
ghostbell/
├── app/
│   ├── api/
│   │   ├── household/          # Household creation & anonymous joining
│   │   │   ├── route.ts
│   │   │   └── join/route.ts
│   │   └── blasts/             # Blast CRUD operations
│   │       ├── route.ts
│   │       └── [id]/
│   │           ├── react/route.ts
│   │           └── done/route.ts
│   ├── bell/[householdId]/     # ⭐ QR landing page (anonymous, main entry)
│   ├── qr/[householdId]/       # QR code generation & print
│   ├── join/[inviteCode]/      # Optional: named join flow (legacy)
│   ├── h/[householdId]/        # Optional: dashboard (legacy)
│   ├── settings/               # User settings (legacy)
│   ├── layout.tsx
│   ├── page.tsx                # Landing page
│   └── globals.css
├── components/                 # React components (future)
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   └── templates.ts           # Message generation templates
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed script
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

**Main Entry Point**: `/bell/[householdId]` - This is where the QR code directs users for instant, anonymous access.

## Database Schema

### Household
- `id`: Unique identifier
- `name`: Household name
- `inviteCode`: Unique invite code for joining
- `personaDefault`: Default narrator persona
- `createdAt`: Timestamp

### Member
- `id`: Unique identifier
- `householdId`: Foreign key to Household
- `displayName`: Member's display name (defaults to "Anonymous")
- `isAnonymous`: Boolean flag for anonymous members (default: true)
- `createdAt`: Timestamp
- `lastActiveAt`: Last activity timestamp

**Note**: Members are auto-created when scanning the QR code. Each device gets its own anonymous member ID stored in localStorage.

### Blast
- `id`: Unique identifier
- `householdId`: Foreign key to Household
- `resource`: Resource type (dryer, washer, etc.)
- `eventType`: Event type (cycle_complete, needs_clearing, etc.)
- `urgency`: Urgency level (whenever, soon, asap)
- `status`: Current status (OPEN, CLAIMED, DONE)
- `createdByMemberId`: Who created the blast
- `claimedByMemberId`: Who claimed it (optional)
- `doneByMemberId`: Who marked it done (optional)
- Timestamps for created, claimed, done

### Reaction
- `id`: Unique identifier
- `blastId`: Foreign key to Blast
- `memberId`: Foreign key to Member
- `kind`: Reaction type (MINE, ON_IT, NOT_ME, ACK)
- `createdAt`: Timestamp

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create new migration
- `npx prisma db seed` - Seed the database

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
```

For production with PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ghostbell"
```

## Narrator Personas

GhostBell supports four narrator personas:

1. **👻 Ghost** - Mysterious and playful
   - "👻 GhostBell detected: dryer cycle appears complete"

2. **🛰️ Space Station** - Technical and efficient
   - "🛰️ House Ops: dryer cycle has concluded"

3. **🧚 House Fairy** - Whimsical and gentle
   - "🧚 House Fairy report: the dryer cycle has finished its journey"

4. **🔔 Neutral System** - Straightforward and simple
   - "🔔 System notification: dryer cycle complete"

## Design Philosophy

GhostBell follows these core principles:
- **Fully Anonymous**: No names, no accounts, no signup. Everyone is anonymous by default.
- **One QR Code**: Print once, post anywhere. Everyone uses the same QR code.
- **No Confrontation**: Never show accusatory copy, names, or pushy notifications
- **Playful Tone**: Use narrator personas to keep things light and fun
- **Minimal Friction**: Scan → Ring → React → Done. Big buttons, no typing.
- **Privacy-First**: No tracking, no analytics, no personal data stored

## Future Enhancements

The codebase is structured to support:
- Server-Sent Events (SSE) for true real-time updates
- Multiple households per user
- Notification preferences
- Custom resource types
- Scheduled blasts
- Analytics dashboard

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT

---

Built with ❤️ for harmonious households
