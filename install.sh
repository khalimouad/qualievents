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

# ─── MAIN ───
print_banner

TOTAL_STEPS=7

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
# Generate slug from name
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

# Step 6: App URL
print_step 6 "Application URL"
if [ "$DEPLOY_MODE" = "saas" ]; then
  DEFAULT_URL="https://${ORG_SLUG}.qualievents.com"
else
  DEFAULT_URL="http://localhost:3000"
fi
prompt_with_default "App URL" "$DEFAULT_URL" APP_URL
print_success "URL: $APP_URL"

# Seed demo data?
echo ""
read -rp "  Include demo events and sample data? (y/n) [y]: " seed_demo
seed_demo="${seed_demo:-y}"
if [ "$seed_demo" = "y" ] || [ "$seed_demo" = "Y" ]; then
  SEED_DEMO_DATA="true"
else
  SEED_DEMO_DATA="false"
fi

# Step 7: Install
print_step 7 "Installing"

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
# QualiEvents Configuration
# Generated by install.sh on $(date)
# Mode: $DEPLOY_MODE

DEPLOY_MODE="$DEPLOY_MODE"
DB_PROVIDER="$DB_PROVIDER"
DATABASE_URL="$DATABASE_URL"
NEXT_PUBLIC_APP_URL="$APP_URL"
SESSION_SECRET="$SESSION_SECRET"

# Organization
ORG_NAME="$ORG_NAME"
ORG_SLUG="$ORG_SLUG"

# Admin (used by seed only, safe to remove after setup)
ADMIN_EMAIL="$ADMIN_EMAIL"
ADMIN_PASS="$ADMIN_PASS"
ADMIN_NAME="$ADMIN_NAME"

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

# ─── Summary ───
echo ""
echo -e "${GREEN}${BOLD}  ╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}  ║       Installation Complete! 🎉       ║${NC}"
echo -e "${GREEN}${BOLD}  ╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Mode:${NC}          $( [ "$DEPLOY_MODE" = "saas" ] && echo -e "${BLUE}SaaS (Multi-tenant)${NC}" || echo -e "${GREEN}On-Premise${NC}" )"
echo -e "  ${BOLD}Organization:${NC}  $ORG_NAME"
echo -e "  ${BOLD}Database:${NC}      $( [ "$DB_PROVIDER" = "postgresql" ] && echo "PostgreSQL" || echo "SQLite" )"
echo -e "  ${BOLD}URL:${NC}           $APP_URL"
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
echo -e "  ${CYAN}npm run dev${NC}        Start development server"
echo -e "  ${CYAN}npm start${NC}          Start production server"
echo ""
echo -e "  ${BOLD}URLs:${NC}"
echo -e "  Home:     ${CYAN}$APP_URL${NC}"
echo -e "  Admin:    ${CYAN}$APP_URL/admin${NC}"
echo -e "  Scanner:  ${CYAN}$APP_URL/scan${NC}"
echo ""
