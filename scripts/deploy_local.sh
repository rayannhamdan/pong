set -e
set -x
set -u

DOCKER_USERNAME="rayhamdan"

# Build images
PLATFORM="linux/arm64" ./scripts/_build.sh

# Run docker compose
docker compose down && docker compose up
