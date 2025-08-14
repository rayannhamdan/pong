set -e
set -x
set -u

USER="debian"
CERTROOT="/home/$USER/certs"

sudo cp /etc/letsencrypt/live/pongparty.fr/fullchain.pem $CERTROOT
sudo cp /etc/letsencrypt/live/pongparty.fr/privkey.pem $CERTROOT
sudo chown $USER $CERTROOT/fullchain.pem
sudo chown $USER $CERTROOT/privkey.pem
