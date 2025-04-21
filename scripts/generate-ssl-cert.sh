#!/bin/bash
# Generate self-signed SSL certificate for development/testing

set -e

CERT_DIR="../nginx/certs"
SUBJECT="/C=US/ST=State/L=City/O=Organization/OU=Power Plant/CN=powerplant.local"

# Create directory if it doesn't exist
mkdir -p $CERT_DIR

# Generate private key
openssl genrsa -out $CERT_DIR/server.key 2048

# Generate CSR (Certificate Signing Request)
openssl req -new -key $CERT_DIR/server.key -out $CERT_DIR/server.csr -subj "$SUBJECT"

# Generate self-signed certificate (valid for 1 year)
openssl x509 -req -days 365 -in $CERT_DIR/server.csr -signkey $CERT_DIR/server.key -out $CERT_DIR/server.crt

# Set permissions
chmod 600 $CERT_DIR/server.key
chmod 644 $CERT_DIR/server.crt

# Remove CSR as it's no longer needed
rm $CERT_DIR/server.csr

echo "Self-signed SSL certificate generated successfully"
echo "Certificate location: $CERT_DIR/server.crt"
echo "Private key location: $CERT_DIR/server.key"
echo ""
echo "Note: For production, replace these with proper certificates from a trusted CA."