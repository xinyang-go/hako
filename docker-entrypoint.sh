#!/bin/sh
set -e

# Data directory for persistent storage
DATA_DIR="/app/data"
ENV_FILE="$DATA_DIR/.env"

# Initialize data directory if it doesn't exist
if [ ! -d "$DATA_DIR" ]; then
  echo "Creating data directory..."
  mkdir -p "$DATA_DIR"
fi

# Generate JWT_SECRET if it doesn't exist in data directory
if [ ! -f "$ENV_FILE" ]; then
  echo "Initializing environment..."
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  echo "JWT_SECRET=$JWT_SECRET" > "$ENV_FILE"
  
  # Add default admin credentials if not set in environment
  if [ -z "$ADMIN_USERNAME" ]; then
    echo "ADMIN_USERNAME=admin" >> "$ENV_FILE"
  fi
  if [ -z "$ADMIN_PASSWORD" ]; then
    echo "ADMIN_PASSWORD=admin123" >> "$ENV_FILE"
  fi
  if [ -z "$ADMIN_EMAIL" ]; then
    echo "ADMIN_EMAIL=admin@example.com" >> "$ENV_FILE"
  fi
  
  echo "Environment initialized with JWT_SECRET in $ENV_FILE"
else
  echo "Using existing environment from $ENV_FILE"
fi

# Export environment variables from data directory
export $(cat "$ENV_FILE" | grep -v '^#' | xargs)

# Override with environment variables from docker run -e
[ -n "$JWT_SECRET" ] && export JWT_SECRET="$JWT_SECRET"
[ -n "$ADMIN_USERNAME" ] && export ADMIN_USERNAME="$ADMIN_USERNAME"
[ -n "$ADMIN_PASSWORD" ] && export ADMIN_PASSWORD="$ADMIN_PASSWORD"
[ -n "$ADMIN_EMAIL" ] && export ADMIN_EMAIL="$ADMIN_EMAIL"

# Execute the main command
exec "$@"
