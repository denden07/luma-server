# madetogether Local Backend

Local development backend for madetogether PWA.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

1. **Install PostgreSQL** (if not already installed):
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Create a database called `madetogether`

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

## Development

```bash
npm run dev
```

Server runs on http://localhost:3000

## API Endpoints

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get a single event
- `POST /api/events` - Create a new event

### Participants
- `GET /api/events/:eventId/participants` - Get all participants for an event
- `POST /api/events/:eventId/participants` - Create a new participant

### Photos
- `GET /api/events/:eventId/photos` - Get all photos for an event
- `GET /api/events/:eventId/photos/download` - Stream all event photos as `madetogether-event-photos.zip`
- `POST /api/events/:eventId/photos` - Upload a photo (multipart/form-data)
- `POST /api/events/:eventId/photos-json` - iOS JSON/base64 upload fallback
- `GET /api/photos/:id` - Get a single photo
- `DELETE /api/photos/:id` - Delete a photo

### Health
- `GET /api/health` - Health check

## File Storage

Uploaded photos are stored in `./uploads/events/{eventId}/photos/`

ZIP downloads are streamed directly to the response using `archiver`; no ZIP archive is
retained on disk after the request completes.

## Database Schema

See `src/db/schema.sql` for the complete database schema.
