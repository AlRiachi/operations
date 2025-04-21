#!/bin/bash
# Generate self-signed SSL certificates for development/testing

set -e

# Create directory for certificates if it doesn't exist
mkdir -p ./nginx/certs

# Generate a self-signed certificate valid for 365 days
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./nginx/certs/server.key \
  -out ./nginx/certs/server.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=powerplant.local"

echo "Self-signed SSL certificate created successfully!"
echo "  - Certificate: ./nginx/certs/server.crt"
echo "  - Private key: ./nginx/certs/server.key"
echo ""
echo "Note: For production, replace these with trusted certificates from a Certificate Authority."