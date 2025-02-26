#!/bin/bash

# Function to display usage
usage() {
  echo "Usage: $0 {up|down|logs} [service]"
  exit 1
}

# Check if at least one argument is provided
if [ $# -lt 1 ]; then
  usage
fi

# Set environment file based on the first argument
case "$1" in
  dev)
    export COMPOSE_FILE=docker-compose.dev.yaml
    export ENV_FILE=.env.dev
    ;;
  prod)
    export COMPOSE_FILE=docker-compose.prod.yaml
    export ENV_FILE=.env.prod
    ;;
  up)
    docker compose --env-file $ENV_FILE up --build -d ${2:-}
    exit 0
    ;;
  down)
    docker compose --env-file $ENV_FILE down
    exit 0
    ;;
  logs)
    docker compose --env-file $ENV_FILE logs -f ${2:-}
    exit 0
    ;;
  *)
    usage
    ;;
esac

# Export the environment variables
set -a
source $ENV_FILE
set +a

# Run the specified Docker Compose command
docker compose --env-file $ENV_FILE ${@:2}
