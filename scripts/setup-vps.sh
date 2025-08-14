set -e
set -x
set -u

VPS_OVH="ovh-vps"

scp scripts/run-setup-on-vps.sh $VPS_OVH:~/setup.sh
scp scripts/cert-renew.service $VPS_OVH:~/cert-renew.service
scp scripts/run-cert-init-on-vps.sh $VPS_OVH:~/cert-init.sh
scp scripts/run-cert-renew-on-vps.sh $VPS_OVH:~/cert-renew.sh
scp scripts/run-cert-copy-on-vps.sh $VPS_OVH:~/cert-copy.sh

ssh $VPS_OVH 'sudo chown root ~/cert-renew.service && sudo mv ~/cert-renew.service /etc/systemd/system && sudo chown root ~/cert-renew.sh && sudo mv ~/cert-renew.sh /usr/local/bin && sudo chown root ~/cert-copy.sh && sudo mv ~/cert-copy.sh /usr/local/bin'

ssh $VPS_OVH '~/setup.sh'
