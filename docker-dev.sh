#!/bin/bash

# Just a wrapper script for scripts/run-docker-dev.sh to make it easier to run

# Check if run-docker-dev.sh exists
if [ ! -f "scripts/run-docker-dev.sh" ]; then
  echo "Error: scripts/run-docker-dev.sh not found"
  exit 1
fi

# Make sure both scripts are executable
chmod +x scripts/run-docker-dev.sh

# Forward arguments to run-docker-dev.sh
scripts/run-docker-dev.sh "$@"