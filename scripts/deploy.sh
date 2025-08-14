set -e
set -x
set -u

DOCKER_USERNAME="rayhamdan"
VPS_HOST="ovh-vps"

# Build images
PLATFORM="linux/amd64" ./scripts/_build.sh

docker login -p $DOCKER_PASSWORD -u $DOCKER_USERNAME

# Push frontend image
docker push $DOCKER_USERNAME/pong-front

# Push backend image
docker push $DOCKER_USERNAME/pong-back

# Deploy new images to remote
scp docker-compose.yaml $VPS_HOST:~/docker-compose.yaml
scp -r redis $VPS_HOST:~/redis
ssh $VPS_HOST 'mkdir -p certs'
scp scripts/run-app-on-vps.sh $VPS_HOST:~/run.sh

ssh $VPS_HOST 'chmod +x ~/run.sh && ~/run.sh'
