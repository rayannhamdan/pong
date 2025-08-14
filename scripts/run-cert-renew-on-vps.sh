set -e
set -x
set -u

sudo /opt/certbot/bin/certbot renew
/usr/local/bin/cert-copy.sh
