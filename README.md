# Power Plant Operations Management System

A comprehensive enterprise-level application for tracking and managing power plant operations, events, defects, and signals.

## Features

- **Event Management**: Track and manage operational events
- **Defect Tracking**: Document and monitor equipment defects
- **Forced Signal Management**: Handle overridden signals from equipment
- **User Authentication**: Role-based access control with admin and operator roles
- **File Upload**: Attach photos to events and defects
- **Export Capabilities**: Export data to PDF and Excel formats
- **Real-time Updates**: Live monitoring of critical plant operations

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Passport.js
- **Real-time Updates**: WebSockets
- **Containerization**: Docker

## Development Setup

### Prerequisites

- Node.js (v16+)
- PostgreSQL database
- Docker (optional)

### Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env`)
4. Start the application:
   ```
   npm run dev
   ```

### Docker Development Setup

1. Make sure Docker and Docker Compose are installed
2. Start the development environment with a single command:
   ```
   ./scripts/start-docker.sh dev
   ```
   This will:
   - Build the Docker images using Dockerfile.dev
   - Start the containers with docker-compose
   - Build the application inside the container
   - Run the application with Node.js

3. Access the application at `http://localhost:5000`

4. To stop the application:
   ```
   ./scripts/stop-docker.sh dev
   ```

## Production Deployment

### Docker Production Setup

1. Build the Docker images:
   ```
   ./build-docker.sh
   ```

2. Start in production mode:
   ```
   ./scripts/start-docker.sh prod
   ```

3. For cloud-based PostgreSQL (e.g., Neon), set the `DATABASE_URL` environment variable:
   ```
   export DATABASE_URL=postgres://username:password@host:port/database
   ```

4. Stop the containers when needed:
   ```
   ./scripts/stop-docker.sh prod
   ```

### Docker Troubleshooting

If you encounter issues with Docker:

1. **Database Connection Errors**:
   - Check that PostgreSQL is running: `docker ps | grep postgres`
   - Verify environment variables: `echo $DATABASE_URL`
   - Check logs: `docker logs operations-postgres-1`

2. **Application Startup Errors**:
   - Check app logs: `docker logs operations-app-1`
   - Ensure database is properly initialized: `./scripts/init-db.sh`

3. **Docker Entrypoint Issues**:
   - If you see errors related to docker-entrypoint.sh, try rebuilding the image with `./build-docker.sh`
   - If problems persist, use the provided start and stop scripts instead of direct Docker commands

## Database Management

The system supports both local PostgreSQL and cloud database providers like Neon:

1. **Initialize database**:
   ```
   ./scripts/init-db.sh
   ```

2. **Backup database**:
   ```
   ./scripts/backup-db.sh
   ```

3. **Restore from backup**:
   ```
   ./scripts/restore-db.sh <backup-file>
   ```

4. **Seed with demo users**:
   ```
   node scripts/seed-users.js
   ```

### Default Credentials

- **Admin User**:
  - Username: `admin`
  - Password: `admin`

- **Operator User**:
  - Username: `operator`
  - Password: `operator`

## Docker Configuration

The application can be deployed in different configurations:

1. **Local Development**: Uses `docker-compose.yml` with volumes for hot reloading
2. **Production with Local Database**: Uses `docker-compose.prod.yml` with persistent database volume
3. **Production with Cloud Database**: Uses environment variables to connect to cloud PostgreSQL

## Support

For questions or support, please contact the development team.