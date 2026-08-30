#!/usr/bin/env bash
set -e

echo "=================================================="
echo "  WHATPART Marketplace — Afrihost VPS Installer  "
echo "=================================================="

# 1. Update system packages
echo "--> Updating system packages..."
apt-get update && apt-get upgrade -y
apt-get install -y curl git ufw nginx python3-certbot-nginx

# 2. Install Node.js 20 LTS & PM2
echo "--> Installing Node.js 20 & PM2 process manager..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

# 3. Clone / Update Repository from GitHub
echo "--> Deploying WHATPART from GitHub..."
mkdir -p /var/www
if [ -d "/var/www/whatpart" ]; then
  cd /var/www/whatpart
  git pull origin main
else
  git clone https://github.com/mraaziqp/WHATPART.git /var/www/whatpart
  cd /var/www/whatpart
fi

# 4. Install Dependencies & Build Production Bundle
echo "--> Building production application..."
npm install
npm run build

# 5. Configure PM2 Process Manager
echo "--> Configuring PM2 process manager..."
pm2 delete whatpart 2>/dev/null || true
pm2 start npm --name "whatpart" -- run preview -- --port 3000 --host 127.0.0.1
pm2 save
pm2 startup | tail -n 1 | bash || true

# 6. Configure Nginx Reverse Proxy
echo "--> Configuring Nginx web server..."
cat << 'EOF' > /etc/nginx/sites-available/whatpart
server {
    listen 80;
    server_name whatpart.africa www.whatpart.africa;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/whatpart /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# 7. Enable Firewall Rules
echo "--> Setting up firewall rules..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "=================================================="
echo "  ✅ WHATPART VPS Deployment Complete!           "
echo "=================================================="
echo "App running on http://127.0.0.1:3000 via PM2 & Nginx"
echo ""
echo "To issue free SSL certificate (HTTPS), run:"
echo "  certbot --nginx -d whatpart.africa -d www.whatpart.africa"
