require('dotenv').config();
const ntfy_bearer = process.env.NTFY_TOKEN;
const https = require('https');
// domains.js must be created which contains array of domains length at least 1 (ie. [{name,zone,dns}])
const domains = require('./domains');
const getIP = () =>
  new Promise((resolve, reject) => {
    const req = https.get('https://api.ipify.org', res => {
      res.on('data', resolve);
      res.on('error', reject);
    });
    req.on('error', reject);
  });
const updateDNS = async () => {
  try {
    const ip = (await getIP()) + '';
    // use akfn.net to detect ip change
    const cfReq = https.get(
      `https://api.cloudflare.com/client/v4/zones/${domains[0].zone}/dns_records/${domains[0].dns}`,
      { headers: { Authorization: `Bearer ${process.env.CF_TOKEN}` } },
      res => {
        let body = '';
        res.on('data', data => (body += data));
        res.on('end', () => {
          const json = JSON.parse(body);
          // don't update on same IP
          console.log(json.result.content, ip);
          if (json.result.content !== ip) {
            const ntfy = https.request({
              hostname: 'ntfy.akfn.net',
              port: 443,
              path: '/cf-ip',
              method: 'POST',
              headers: { Authorization: `Bearer ${ntfy_bearer}` },
            });
            ntfy.on('error', e => console.error('error on ntfy request', e));
            ntfy.write(`New IP for ${domains[0].name} ${ip}`);
            ntfy.end();
            console.log('new IP detected:', ip);
            for (let i = 0, il = domains.length; i < il; i++) {
              const { name, zone, dns } = domains[i];
              const now = new Date();
              const putReq = https.request(
                {
                  host: 'api.cloudflare.com',
                  path: `/client/v4/zones/${zone}/dns_records/${dns}`,
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${process.env.CF_TOKEN}`,
                    'Content-Type': 'application/json',
                  },
                },
                res => res.on('error', e => console.error(name, 'response error', e))
              );
              putReq.on('error', e => console.error(name, 'request error', e));
              putReq.end(
                JSON.stringify({
                  type: 'A',
                  name: name,
                  content: ip,
                  ttl: 1,
                  proxied: true,
                  comment: `updated at ${now.toISOString()}`,
                })
              );
            }
          }
        });
        res.on('error', e => console.error('error on dns GET response', e));
      }
    );
    cfReq.on('error', e => console.error('error on dns GET request', e));
  } catch (e) {
    console.error('error on IP GET', e);
  }
};
updateDNS();
