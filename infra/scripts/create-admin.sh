#!/usr/bin/env bash
# create-admin.sh — create the default platform_admin user with an email+password
# login. Password is hashed with node:crypto scrypt (no bcrypt package). The hash
# is computed on the host; the row is written into the postgres container.
# Idempotent: skips if the admin already exists.
set -euo pipefail

EMAIL="admin@malayalidoctor.com"
PASSWORD="MalayaliAdmin@2026"
PG_CONTAINER="${PG_CONTAINER:-khp-khp-postgres-1}"

# scrypt hash: "scrypt$<saltHex>$<keyHex>" (matches services/auth/password.js).
HASH="$(node -e 'const c=require("node:crypto");const s=c.randomBytes(16);const k=c.scryptSync(process.argv[1],s,64);process.stdout.write("scrypt$"+s.toString("hex")+"$"+k.toString("hex"))' "$PASSWORD")"

docker exec -i "$PG_CONTAINER" psql -U khp -d khp -v ON_ERROR_STOP=1 <<SQL
INSERT INTO users (role, full_name, email_plain, admin_username, password_hash, is_verified)
SELECT 'platform_admin', 'Platform Admin', '${EMAIL}', '${EMAIL}', '${HASH}', true
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE admin_username = '${EMAIL}' OR lower(email_plain) = lower('${EMAIL}')
);
-- Ensure an existing admin (created before) has verification + username set.
UPDATE users SET is_verified = true, admin_username = COALESCE(admin_username, '${EMAIL}')
 WHERE lower(email_plain) = lower('${EMAIL}') AND role = 'platform_admin';
SQL

echo "Admin user created: admin@malayalidoctor.com"
