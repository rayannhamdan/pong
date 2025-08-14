set -e
set -x
set -u

sudo docker compose down
sudo docker compose up --pull always -d
