# Deployment Secrets

GitHub Actions deployment pipeline requires the following secrets to be configured in the repository settings under "Environments > production":

## Required Secrets

| Secret Name | Purpose | Example |
|---|---|---|
| `VPS_HOST` | VPS server IP or hostname | `194.164.151.202` |
| `VPS_USER` | SSH username for VPS | `root` |
| `VPS_SSH_KEY` | SSH private key (add as GitHub secret) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `GHCR_TOKEN` | GitHub Container Registry token | `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `PRODUCTION_ENV_FILE_PATH` | Path to .env file on VPS | `/opt/kerala-healthcare-platform/.env.prod` |

## Setup Instructions

1. Generate SSH key pair (if not already present):
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/khp-deploy -N ""
   ```

2. Add public key to VPS:
   ```bash
   ssh-copy-id -i ~/.ssh/khp-deploy.pub root@194.164.151.202
   ```

3. In GitHub repository, go to Settings > Environments > production
4. Create environment if not exists
5. Add the following secrets:
   - `VPS_HOST`: `194.164.151.202`
   - `VPS_USER`: `root`
   - `VPS_SSH_KEY`: (paste contents of ~/.ssh/khp-deploy)
   - `GHCR_TOKEN`: (create at https://github.com/settings/tokens with `write:packages` scope)
   - `PRODUCTION_ENV_FILE_PATH`: `/opt/kerala-healthcare-platform/.env.prod`

## Required Reviewers

Set required reviewers for the production environment to enforce approval before deployment.

## Deployment Flow

1. Commit to main branch triggers `deploy.yml`
2. Build Docker image and push to GitHub Container Registry
3. SSH to VPS and deploy using docker-compose
4. Run database migrations
5. Health check (curl https://malayalimed.com/en)
6. Auto-rollback on health check failure

## Rollback Procedure

If deployment fails:
1. Previous image tag is saved in `/tmp/previous_image_tag` on VPS
2. Rollback step automatically restores previous image
3. Manual intervention may be required if rollback also fails
