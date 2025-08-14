PLATFORM="${PLATFORM:-linux/arm64}"

set -e
set -x
set -u

DOCKER_USERNAME="rayhamdan"

# Build frontend image
docker build --platform $PLATFORM -t $DOCKER_USERNAME/pong-front .

# Build backend image
docker build --platform $PLATFORM -t $DOCKER_USERNAME/pong-back back
