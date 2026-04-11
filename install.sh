#!/usr/bin/env bash
set -e

# ============================================
# QualiEvents Installer
# Interactive setup for on-premise or SaaS
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

print_banner() {
  echo ""
  echo -e "${RED}${BOLD}  ╔═══════════════════════════════════════╗${NC}"
  echo -e "${RED}${BOLD}  ║         QualiEvents Installer         ║${NC}"
  echo -e "${RED}${BOLD}  ║     Premium Event Management Platform ║${NC}"
  echo -e "${RED}${BOLD}  ╚═══════════════════════════════════════╝${NC}"
  echo ""
}

print_step() {
  echo -e "\n${CYAN}${BOLD}[$1/$TOTAL_STEPS]${NC} ${BOLD}$2${NC}"
  echo -e "${DIM}─────────────────────────────────────────${NC}"
}

print_success() {
  echo -e "  ${GREEN}✓${NC} $1"
}

print_info() {
  echo -e "  ${BLUE}→${NC} $1"
}

print_warn() {
  echo -e "  ${YELLOW}!${NC} $1"
}

prompt_with_default() {
  local prompt="$1"
  local default="$2"
  local var_name="$3"
  if [ -n "$default" ]; then
    read -rp "  $prompt [$default]: " value
    value="${value:-$default}"
  else
    read -rp "  $prompt: " value
  fi
  eval "$var_name='$value'"
}

prompt_password() {
  local prompt="$1"
  local var_name="$2"
  while true; do
    read -srp "  $prompt: " pass1
    echo ""
    read -srp "  Confirm password: " pass2
    echo ""
    if [ "$pass1" = "$pass2" ]; then
      if [ ${#pass1} -lt 6 ]; then
        echo -e "  ${RED}Password must be at least 6 characters.${NC}"
        continue
      fi
      eval "$var_name='$pass1'"
      return
    else
      echo -e "  ${RED}Passwords don't match. Try again.${NC}"
    fi
  done
}

# ─── Check prerequisites ───
check_prerequisites() {
  local missing=0
  for cmd in node npm npx; do
    if ! command -v $cmd &>/dev/null; then
      echo -e "  ${RED}✗ $cmd not found${NC}"
      missing=1
    fi
  done
  if [ $missing -eq 1 ]; then
    echo -e "\n${RED}Please install Node.js (v18+) before running this installer.${NC}"
    exit 1
  fi
  local node_version=$(node -v | sed 's/v//' | cut -d. -f1)
  if [ "$node_version" -lt 18 ]; then
    echo -e "  ${RED}Node.js v18+ required (found v$(node -v))${NC}"
    exit 1
  fi
  print_success "Node.js $(node -v) and npm $(npm -v) found"
}

# ─── Detect Server IP ───
# Tries multiple sources: public IP services first, then local interface
detect_server_ip() {
  local ip=""

  # Try public IP detection (external services)
  for service in "https://ifconfig.me" "https://icanhazip.com" "https://api.ipify.org" "https://ipinfo.io/ip"; do
    ip=$(curl -s --max-time 3 "$service" 2>/dev/null | tr -d '[:space:]')
    if [[ "$ip" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      echo "$ip"
      return 0
    fi
  done

  # Fallback: local IP from default route interface
  ip=$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' | head -1)
  if [[ "$ip" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "$ip"
    return 0
  fi

  # Last resort: hostname -I
  ip=$(hostname -I 2>/dev/null | awk '{print $1}')
  if [[ "$ip" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "$ip"
    return 0
  fi

  echo ""
  return 1
}

# ─── SSL Setup ───
setup_ssl() {
  local domain="$1"
  local email="$2"
  local port="${3:-3000}"

  echo ""
  print_info "Installing Nginx and Certbot..."

  # Detect package manager
  if command -v apt-get &>/dev/null; then
    sudo apt-get update -qq
    sudo apt-get install -y -qq nginx certbot python3-certbot-nginx >/dev/null 2>&1
  elif command -v yum &>/dev/null; then
    sudo yum install -y -q nginx certbot python3-certbot-nginx >/dev/null 2>&1
  elif command -v dnf &>/dev/null; then
    sudo dnf install -y -q nginx certbot python3-certbot-nginx >/dev/null 2>&1
  else
    print_warn "Could not detect package manager. Install nginx and certbot manually."
    return 1
  fi
  print_success "Nginx and Certbot installed"

  # Write Nginx config
  print_info "Configuring Nginx reverse proxy..."
  sudo tee /etc/nginx/sites-available/qualievents >/dev/null << NGINXEOF
server {
    listen 80;
    server_name $domain;

    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
}
NGINXEOF

  # Enable site
  sudo ln -sf /etc/nginx/sites-available/qualievents /etc/nginx/sites-enabled/
  sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null
  sudo nginx -t >/dev/null 2>&1
  sudo systemctl reload nginx
  print_success "Nginx configured for $domain"

  # Get SSL certificate
  print_info "Obtaining SSL certificate from Let's Encrypt..."
  sudo certbot --nginx -d "$domain" --non-interactive --agree-tos -m "$email" --redirect 2>&1 | tail -5
  print_success "SSL certificate installed for $domain"

  # Auto-renewal
  sudo systemctl enable certbot.timer 2>/dev/null || true
  print_success "Auto-renewal enabled"

  return 0
}

# ─── Create systemd service ───
create_service() {
  local app_dir="$(pwd)"
  local node_path="$(which node)"

  print_info "Creating systemd service..."
  sudo tee /etc/systemd/system/qualievents.service >/dev/null << SVCEOF
[Unit]
Description=QualiEvents Application
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$app_dir
ExecStart=$node_path $app_dir/node_modules/.bin/next start -p ${APP_PORT:-3000} -H 0.0.0.0
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=$app_dir/.env

[Install]
WantedBy=multi-user.target
SVCEOF

  sudo systemctl daemon-reload
  sudo systemctl enable qualievents
  print_success "Systemd service created (qualievents.service)"
}

# ─── MAIN ───
print_banner

TOTAL_STEPS=8
SETUP_SSL="n"
SETUP_DOMAIN=""
APP_PORT=3000

# Step 1: Choose mode
print_step 1 "Deployment Mode"
echo ""
echo -e "  ${BOLD}[1]${NC} ${GREEN}On-Premise${NC} — Single company, SQLite, self-hosted"
echo -e "      Best for: one organization managing their own events"
echo ""
echo -e "  ${BOLD}[2]${NC} ${BLUE}SaaS${NC} — Multi-tenant, PostgreSQL, cloud-ready"
echo -e "      Best for: hosting events for multiple organizations"
echo ""
read -rp "  Choose mode (1 or 2) [1]: " mode_choice
mode_choice="${mode_choice:-1}"

if [ "$mode_choice" = "2" ]; then
  DEPLOY_MODE="saas"
  DB_PROVIDER="postgresql"
  echo ""
  print_success "SaaS mode selected (PostgreSQL + multi-tenant)"
else
  DEPLOY_MODE="onpremise"
  DB_PROVIDER="sqlite"
  echo ""
  print_success "On-Premise mode selected (SQLite + single company)"
fi

# Step 2: Organization
print_step 2 "Organization"
prompt_with_default "Organization name" "My Company" ORG_NAME
DEFAULT_SLUG=$(echo "$ORG_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
prompt_with_default "Organization slug (URL-safe)" "$DEFAULT_SLUG" ORG_SLUG
print_success "Organization: $ORG_NAME ($ORG_SLUG)"

# Step 3: Admin account
print_step 3 "Admin Account"
prompt_with_default "Admin name" "Admin" ADMIN_NAME
prompt_with_default "Admin email" "admin@${ORG_SLUG}.com" ADMIN_EMAIL
prompt_password "Admin password" ADMIN_PASS
print_success "Admin: $ADMIN_EMAIL (role: admin)"

# Step 4: Database
print_step 4 "Database"
if [ "$DEPLOY_MODE" = "saas" ]; then
  echo -e "  ${YELLOW}PostgreSQL connection string required.${NC}"
  echo -e "  ${DIM}Format: postgresql://user:password@host:5432/dbname${NC}"
  prompt_with_default "PostgreSQL URL" "" DATABASE_URL
  while [ -z "$DATABASE_URL" ]; do
    echo -e "  ${RED}Database URL is required for SaaS mode.${NC}"
    prompt_with_default "PostgreSQL URL" "" DATABASE_URL
  done
  print_success "PostgreSQL: ${DATABASE_URL:0:30}..."
else
  DATABASE_URL="file:./dev.db"
  print_success "SQLite: ./prisma/dev.db (local file)"
fi

# Step 5: Email (SMTP)
print_step 5 "Email Configuration"
echo ""
echo -e "  ${DIM}Configure SMTP to enable invitations, newsletters, and badge emails.${NC}"
echo -e "  ${DIM}You can skip this and configure later in .env${NC}"
echo ""
read -rp "  Configure email now? (y/n) [y]: " setup_email
setup_email="${setup_email:-y}"

if [ "$setup_email" = "y" ] || [ "$setup_email" = "Y" ]; then
  prompt_with_default "SMTP host" "smtp.gmail.com" SMTP_HOST
  prompt_with_default "SMTP port" "587" SMTP_PORT
  prompt_with_default "SMTP username (email)" "" SMTP_USER
  read -srp "  SMTP password: " SMTP_PASS
  echo ""
  print_success "Email: $SMTP_USER via $SMTP_HOST:$SMTP_PORT"
else
  SMTP_HOST="smtp.gmail.com"
  SMTP_PORT="587"
  SMTP_USER=""
  SMTP_PASS=""
  print_info "Email skipped. Configure SMTP_* in .env later."
fi

# Detect server IP early so it can be used in steps 6 and 7
print_info "Detecting server IP address..."
SERVER_IP=$(detect_server_ip)
if [ -n "$SERVER_IP" ]; then
  print_success "Detected IP: $SERVER_IP"
else
  print_warn "Could not detect server IP automatically"
  SERVER_IP=""
fi

# Step 6: Domain & SSL (optional)
print_step 6 "Domain & SSL (Optional)"
echo ""
echo -e "  ${DIM}Set up a custom domain with free SSL via Let's Encrypt.${NC}"
echo -e "  ${DIM}Requires: a domain pointing to this server + sudo access.${NC}"
echo -e "  ${DIM}Skip this to use the server IP directly.${NC}"
echo ""
read -rp "  Configure domain & SSL? (y/n) [n]: " setup_domain_choice
setup_domain_choice="${setup_domain_choice:-n}"

if [ "$setup_domain_choice" = "y" ] || [ "$setup_domain_choice" = "Y" ]; then
  SETUP_SSL="y"
  prompt_with_default "Domain name" "events.${ORG_SLUG}.com" SETUP_DOMAIN
  prompt_with_default "Email for SSL certificate" "$ADMIN_EMAIL" SSL_EMAIL
  APP_URL="https://$SETUP_DOMAIN"
  print_success "Domain: $SETUP_DOMAIN (SSL via Let's Encrypt)"
else
  SETUP_DOMAIN=""
  if [ -n "$SERVER_IP" ]; then
    APP_URL="http://$SERVER_IP:3000"
    print_info "Using auto-detected IP: $APP_URL"
  else
    APP_URL="http://localhost:3000"
    print_info "Using localhost (could not detect IP)"
  fi
fi

# Step 7: Final options
print_step 7 "Final Options"

# Port (skipped if SSL via Nginx — Nginx handles 80/443 -> 3000)
if [ "$SETUP_SSL" = "y" ]; then
  APP_PORT=3000
else
  prompt_with_default "Application port" "3000" APP_PORT
fi

# Custom app URL override (only if no domain was set)
if [ -z "$SETUP_DOMAIN" ]; then
  if [ "$DEPLOY_MODE" = "saas" ]; then
    DEFAULT_URL="https://${ORG_SLUG}.qualievents.com"
  elif [ -n "$SERVER_IP" ]; then
    DEFAULT_URL="http://${SERVER_IP}:${APP_PORT}"
  else
    DEFAULT_URL="http://localhost:${APP_PORT}"
  fi
  prompt_with_default "App URL" "$DEFAULT_URL" APP_URL
fi
print_success "URL: $APP_URL"

# Seed demo data?
echo ""
read -rp "  Include demo events and sample data? (y/n) [y]: " seed_demo
seed_demo="${seed_demo:-y}"
if [ "$seed_demo" = "y" ] || [ "$seed_demo" = "Y" ]; then
  SEED_DEMO_DATA="true"
  print_success "Demo data will be included"
else
  SEED_DEMO_DATA="false"
  print_info "Clean install (no demo data)"
fi

# Step 8: Install
print_step 8 "Installing"

# Generate session secret
SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
print_success "Session secret generated"

# Swap Prisma provider for SaaS mode
if [ "$DEPLOY_MODE" = "saas" ]; then
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
  print_success "Prisma schema set to PostgreSQL"
fi

# Write .env
cat > .env << ENVEOF
# ============================================
# QualiEvents Configuration
# Generated by install.sh on $(date)
# Mode: $DEPLOY_MODE
# ============================================

DEPLOY_MODE="$DEPLOY_MODE"
DATABASE_URL="$DATABASE_URL"
NEXT_PUBLIC_APP_URL="$APP_URL"
PORT="$APP_PORT"
HOSTNAME="0.0.0.0"
SESSION_SECRET="$SESSION_SECRET"

# Organization
ORG_NAME="$ORG_NAME"
ORG_SLUG="$ORG_SLUG"

# Admin (used by seed only, safe to remove after setup)
ADMIN_EMAIL="$ADMIN_EMAIL"
ADMIN_PASS="$ADMIN_PASS"
ADMIN_NAME="$ADMIN_NAME"

# Domain & SSL
DOMAIN="$SETUP_DOMAIN"

# Email (SMTP)
SMTP_HOST="$SMTP_HOST"
SMTP_PORT="$SMTP_PORT"
SMTP_USER="$SMTP_USER"
SMTP_PASS="$SMTP_PASS"

# SMS (Twilio) - Optional
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# Demo data
SEED_DEMO_DATA="$SEED_DEMO_DATA"
ENVEOF
print_success ".env file created"

# Install dependencies
echo ""
print_info "Installing dependencies..."
npm install --silent 2>&1 | tail -3
print_success "Dependencies installed"

# Generate Prisma client
print_info "Generating database client..."
npx prisma generate --schema=prisma/schema.prisma 2>&1 | tail -1
print_success "Prisma client generated"

# Run migrations
print_info "Running database migrations..."
if [ "$DEPLOY_MODE" = "saas" ]; then
  npx prisma migrate deploy 2>&1 | tail -3
else
  npx prisma migrate dev --name init --skip-seed 2>&1 | tail -3
fi
print_success "Database migrated"

# Seed
print_info "Creating admin user and seeding data..."
npx tsx prisma/seed.ts 2>&1
print_success "Database seeded"

# Build
print_info "Building application..."
npm run build 2>&1 | tail -3
print_success "Application built"

# SSL & Nginx setup (if chosen)
if [ "$SETUP_SSL" = "y" ] && [ -n "$SETUP_DOMAIN" ]; then
  echo ""
  print_info "Setting up domain & SSL..."

  # Check if running as root or has sudo
  if [ "$EUID" -ne 0 ] && ! sudo -n true 2>/dev/null; then
    echo ""
    print_warn "SSL setup requires sudo access."
    read -rp "  Continue with SSL setup? (will prompt for sudo password) (y/n) [y]: " ssl_continue
    ssl_continue="${ssl_continue:-y}"
    if [ "$ssl_continue" != "y" ] && [ "$ssl_continue" != "Y" ]; then
      print_info "SSL setup skipped. You can set it up manually later."
      SETUP_SSL="n"
    fi
  fi

  if [ "$SETUP_SSL" = "y" ]; then
    if setup_ssl "$SETUP_DOMAIN" "$SSL_EMAIL" "$APP_PORT"; then
      print_success "SSL setup complete!"

      # Create systemd service for auto-start
      create_service
    else
      print_warn "SSL setup failed. App will still work on $APP_URL"
      print_info "To set up SSL manually later:"
      echo -e "    ${DIM}1. Install nginx and certbot${NC}"
      echo -e "    ${DIM}2. Point your domain to this server's IP${NC}"
      echo -e "    ${DIM}3. Run: sudo certbot --nginx -d $SETUP_DOMAIN${NC}"
    fi
  fi
fi

# ─── Summary ───
echo ""
echo -e "${GREEN}${BOLD}  ╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}  ║       Installation Complete! 🎉       ║${NC}"
echo -e "${GREEN}${BOLD}  ╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Mode:${NC}          $( [ "$DEPLOY_MODE" = "saas" ] && echo -e "${BLUE}SaaS (Multi-tenant)${NC}" || echo -e "${GREEN}On-Premise${NC}" )"
echo -e "  ${BOLD}Organization:${NC}  $ORG_NAME"
echo -e "  ${BOLD}Database:${NC}      $( [ "$DB_PROVIDER" = "postgresql" ] && echo "PostgreSQL" || echo "SQLite" )"
echo -e "  ${BOLD}URL:${NC}           ${CYAN}$APP_URL${NC}"

if [ -n "$SETUP_DOMAIN" ] && [ "$SETUP_SSL" = "y" ]; then
  echo -e "  ${BOLD}Domain:${NC}        ${CYAN}$SETUP_DOMAIN${NC}"
  echo -e "  ${BOLD}SSL:${NC}           ${GREEN}Let's Encrypt (auto-renewal)${NC}"
fi

echo ""
echo -e "  ${BOLD}Admin Login:${NC}"
echo -e "  Email:    ${CYAN}$ADMIN_EMAIL${NC}"
echo -e "  Password: ${DIM}(the one you entered)${NC}"
echo ""
if [ "$SEED_DEMO_DATA" = "true" ]; then
  echo -e "  ${BOLD}Staff Login:${NC}"
  echo -e "  Email:    ${CYAN}staff@qualievents.com${NC}"
  echo -e "  Password: ${DIM}staff123${NC}"
  echo ""
fi
echo -e "  ${BOLD}Quick Start:${NC}"
if [ -n "$SETUP_DOMAIN" ] && [ "$SETUP_SSL" = "y" ]; then
  echo -e "  ${CYAN}sudo systemctl start qualievents${NC}   Start the app"
  echo -e "  ${CYAN}sudo systemctl status qualievents${NC}  Check status"
  echo -e "  ${CYAN}sudo systemctl stop qualievents${NC}    Stop the app"
else
  echo -e "  ${CYAN}npm run dev${NC}        Start development server"
  echo -e "  ${CYAN}npm start${NC}          Start production server"
fi
echo ""
echo -e "  ${BOLD}URLs:${NC}"
echo -e "  Home:     ${CYAN}$APP_URL${NC}"
echo -e "  Admin:    ${CYAN}$APP_URL/admin${NC}"
echo -e "  Scanner:  ${CYAN}$APP_URL/scan${NC}"
echo ""

if [ -n "$SETUP_DOMAIN" ] && [ "$SETUP_SSL" = "y" ]; then
  echo -e "  ${BOLD}SSL Certificate:${NC}"
  echo -e "  ${DIM}Renews automatically via certbot.timer${NC}"
  echo -e "  ${DIM}Check: sudo certbot certificates${NC}"
  echo -e "  ${DIM}Manual renew: sudo certbot renew${NC}"
  echo ""
fi

echo -e "  ${DIM}Config file: .env${NC}"
echo -e "  ${DIM}Reinstall:   bash install.sh${NC}"
echo ""
