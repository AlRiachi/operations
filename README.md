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

4. Start the application using the production configuration:
   ```
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. Access the application at http://localhost:5000

### Managing the Database

#### Backing up the database

```
docker-compose exec postgres pg_dump -U postgres powerplantapp > backup.sql
```

#### Restoring the database

```
cat backup.sql | docker-compose exec -T postgres psql -U postgres powerplantapp
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

## Architecture

- Frontend: React, TypeScript, TailwindCSS, Shadcn UI
- Backend: Node.js, Express, Drizzle ORM
- Database: PostgreSQL
- Communication: WebSockets for real-time updates