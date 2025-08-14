set -e
set -x
set -u

DOMAIN="pongparty.fr"
CERTROOT="./certs"
EMAIL="rayann.hamdan@hotmail.fr"

sudo certbot certonly -d $DOMAIN --webroot -m $EMAIL
/usr/local/bin/cert-copy.sh

