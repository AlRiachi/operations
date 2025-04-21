# Power Plant Operations Management System

A web-based enterprise-level system for tracking events, defects, and signals in power plant operations.

## Docker Deployment Guide

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Development Deployment

1. Clone the repository:
   ```
   git clone <repository-url>
   cd power-plant-ops
   ```

2. Start the application:
   ```
   docker-compose up -d
   ```

3. Access the application at http://localhost:5000

### Production Deployment

1. Clone the repository:
   ```
   git clone <repository-url>
   cd power-plant-ops
   ```

2. Create a `.env` file from the example:
   ```
   cp .env.example .env
   ```

3. Edit the `.env` file and set secure passwords and secrets:
   ```
   # For example, generate a secure session secret:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Generate SSL certificates (for testing, or add your own certificates):
   ```
   # For self-signed certificates (development/testing only)
   chmod +x scripts/generate-ssl-cert.sh
   ./scripts/generate-ssl-cert.sh
   
   # For production, replace the certificates in nginx/certs/ with trusted ones
   ```

5. Start the application using the production configuration:
   ```
   docker-compose -f docker-compose.prod.yml up -d
   ```

6. Access the application:
   - HTTP: http://your-server-ip:80 (redirects to HTTPS)
   - HTTPS: https://your-server-ip:443

### Managing the Database

#### Backing up the database

The system automatically creates daily backups in the `/app/backups` directory inside the container, which is mapped to the `app_backups` volume.

To manually back up the database:

```bash
# Using the built-in script (recommended)
docker-compose exec app ./scripts/backup-db.sh

# Or with a direct command
docker-compose exec postgres pg_dump -U postgres powerplantapp > backup.sql
```

#### Restoring the database

```bash
# Using the built-in script
docker-compose exec app ./scripts/restore-db.sh /app/backups/powerplantapp_YYYYMMDD_HHMMSS.sql.gz

# Or with a direct command
cat backup.sql | docker-compose exec -T postgres psql -U postgres powerplantapp
```

### Maintenance Operations

#### Viewing logs

```bash
# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f postgres

# Web server logs
docker-compose logs -f nginx
```

#### Restarting services

```bash
# Restart the entire stack
docker-compose restart

# Restart individual services
docker-compose restart app
docker-compose restart postgres
docker-compose restart nginx
```

#### Updating the application

```bash
# Pull the latest code
git pull

# Rebuild and restart containers
docker-compose down
docker-compose up -d --build
```

## Default Users

- Admin: 
  - Username: admin
  - Password: admin123
- Operator: 
  - Username: operator
  - Password: operator123

*Note: Change these passwords in production!*

## Key Features

- Event tracking and management
- Defect reporting and resolution tracking
- Forced signal monitoring and control
- Role-based access control
- Real-time data updates via WebSockets
- Export capabilities to PDF and Excel
- Mobile-responsive design
- Docker and PostgreSQL deployment for easier installation
- Daily database backups
- SSL support with NGINX

## Architecture

- Frontend: React, TypeScript, TailwindCSS, Shadcn UI
- Backend: Node.js, Express, Drizzle ORM
- Database: PostgreSQL
- Communication: WebSockets for real-time updates
- Deployment: Docker, Docker Compose, NGINX