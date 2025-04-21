# Power Plant Operations Management System

A comprehensive web-based system designed for enterprise-level tracking and management of events, defects, and signals in power plant operations.

## Features

- **Event Management**: Track and manage operational events
- **Defect Tracking**: Record and monitor equipment defects with severity levels
- **Forced Signal Management**: Override sensor values with manual entries
- **Role-based Access Control**: Admin and operator roles with different permissions
- **Real-time Updates**: Live data updates via WebSockets
- **Data Export**: Export data to PDF and Excel formats
- **Image Upload**: Attach photos to events and defects

## Technology Stack

- **Frontend**: React with TypeScript, TailwindCSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **Containerization**: Docker with multi-container setup

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

### Development Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd power-plant-app
   ```

2. Start the development environment:
   ```
   docker-compose up
   ```

3. Access the application at:
   ```
   http://localhost:5000
   ```

### Production Deployment

1. Configure environment variables by copying `.env.example` to `.env` and updating values:
   ```
   cp .env.example .env
   ```

2. Generate SSL certificates (or provide your own):
   ```
   cd scripts
   ./generate-ssl-cert.sh
   ```

3. Start the production environment:
   ```
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. Access the application via HTTPS:
   ```
   https://<your-domain>
   ```

## Database Management

### Backup Database

```
docker exec -it powerplant-app_app_1 /bin/bash -c "/app/scripts/backup-db.sh"
```

### Restore Database

```
docker exec -it powerplant-app_app_1 /bin/bash -c "/app/scripts/restore-db.sh /app/backups/your-backup-file.sql.gz"
```

## Default Users

The system comes with two default users:

1. Admin User:
   - Username: `admin`
   - Password: `admin123`
   - Role: `admin`

2. Operator User:
   - Username: `operator`
   - Password: `operator123`
   - Role: `operator`

## Database Configuration

The PostgreSQL database is configured with the following credentials:

- **Username**: `root`
- **Password**: `Resheh-2019`
- **Database**: `powerplantapp`
- **Host**: `postgres` (inside Docker network)

## License

[MIT License](LICENSE)

## Contributors

- [Your Name/Team]