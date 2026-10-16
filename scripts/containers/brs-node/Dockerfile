FROM node:24-slim

ARG ECP_BUNDLE=/usr/local/lib/node_modules/brs-node/bin/brs.ecp.js

# Roku TVs announce DIAL's WAKEUP in their SSDP answers and brs-node doesn't, so its answers get one with
# the MAC this container has at runtime.
RUN apt-get update \
    && apt-get install --yes --no-install-recommends iproute2 \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global brs-node@2.6.1 \
    && sed -i 's|headers:{"device-group.roku.com":"46F5CCE2472F2B14D77"}|headers:{"device-group.roku.com":"46F5CCE2472F2B14D77",WAKEUP:process.env.WAKEUP}|' "$ECP_BUNDLE" \
    && grep -q "WAKEUP:process.env.WAKEUP" "$ECP_BUNDLE"

COPY channel /channel
COPY wake.js /wake.js

WORKDIR /channel

CMD ["sh", "-c", "export WAKEUP=\"MAC=$(cat /sys/class/net/eth0/address);Timeout=10\"; node /wake.js & exec brs-cli --ecp --root /channel source/main.brs"]
