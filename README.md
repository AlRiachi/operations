# Power Plant Operations Management System

A comprehensive enterprise-level platform for tracking and managing power plant operations, events, defects, and signals.

## Key Features

- **Real-time Dashboard**: Monitor plant operations with real-time status indicators
- **Event Management**: Track and manage operational events with detailed tracking
- **Defect Tracking**: Record and track defects with severity levels and assignment
- **Forced Signal Management**: Log and monitor forced signals that override normal operations
- **Role-based Access**: Different permissions for operators and administrators
- **Photo Upload**: Attach images to events and defects
- **Export Functionality**: Export data to PDF and Excel formats

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn UI components
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based authentication with Passport
- **Deployment**: Docker for containerization

## Running the Application

### Prerequisites

- Docker and Docker Compose installed
- Git

### Development Environment

1. Clone the repository:
   ```
   git clone <repository-url>
   cd powerplant-app
   ```

2. Build and start the Docker containers:
   ```
   # Make scripts executable
   chmod +x build-docker.sh scripts/*.sh wait-for-postgres.sh docker-entrypoint.sh
   
   # Build Docker images
   ./build-docker.sh
   
   # Start the application in development mode
   ./scripts/start-docker.sh
   ```

3. Access the application:
   - Web interface: http://localhost:5000
   - Default users:
     - Admin: username `admin`, password `password`
     - Operator: username `operator`, password `password`

### Production Environment

1. Build and start the production Docker containers:
   ```
   # Build production Docker images
   ./build-docker.sh prod
   
   # Start the application in production mode
   ./scripts/start-docker.sh prod
   ```

2. To stop the containers:
   ```
   # Stop development containers
   ./scripts/stop-docker.sh
   
   # Or stop production containers
   ./scripts/stop-docker.sh prod
   ```

## Environment Variables

The following environment variables can be configured in the `.env` file:

- `DATABASE_URL`: PostgreSQL connection URL
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`: PostgreSQL connection details
- `SESSION_SECRET`: Secret for session cookies
- `NODE_ENV`: Environment (`development` or `production`)
- `PORT`: Port for the application (default: 5000)

## Database Management

- **Database Migration**: Run `npm run db:push` to update the database schema
- **Database Backup**: Run `./scripts/backup-db.sh` to backup the database
- **Database Restore**: Run `./scripts/restore-db.sh <backup-file>` to restore from a backup

## Development Notes

- The application has two Dockerfiles:
  - `Dockerfile.dev` for development with hot reloading
  - `Dockerfile` for production with optimized builds
  
- Local development can also be done outside Docker:
  ```
  npm install
  npm run dev
  ```

- When using a cloud database like Neon, update the `DATABASE_URL` in your `.env` file with the appropriate connection string

## Deployment Options

1. **Local Docker Deployment**:
   - Suitable for internal networks
   - Uses local PostgreSQL container
   - See instructions above

2. **Cloud Database with Local Application**:
   - Use a cloud database provider like Neon
   - Set up environment variables to point to the cloud database
   - Deploy application container only

3. **Full Cloud Deployment**:
   - Deploy Docker images to a cloud provider
   - Use a managed PostgreSQL service or deploy a PostgreSQL container