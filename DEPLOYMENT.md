# Deploying GymBuddy AI to AWS App Runner

- **For minimal cost / education**: use the step-by-step guide **[APP-RUNNER-FREE-TIER.md](APP-RUNNER-FREE-TIER.md)** (smallest instance, pause when not in use).
- This page covers all deployment options in more detail.

## Prerequisites

- AWS account with access to App Runner
- GitHub repo with this project (see README for push steps)
- Docker installed locally (optional; only if you build and push images yourself)

---

## Option A: Deploy from GitHub with Dockerfile (recommended)

App Runner can build from your GitHub repo using the Dockerfile in the project.

### 1. Create an App Runner service

1. In the **AWS Console**, go to **App Runner** → **Create service**.
2. **Source and deployment**:
   - **Repository type**: Source code repository
   - **Connect to GitHub**: Authorize and select your **gymbuddy-ai** repo and branch (e.g. `main`).
   - **Deployment settings**:
     - **Configuration source**: Use a configuration file (or “Configure all settings here”)
     - **Runtime**: Docker
     - **Build command**: leave default (App Runner will run `docker build` using the Dockerfile).
     - **Run command**: leave default (`docker run`; the Dockerfile uses `CMD ["node", "server.js"]`).
3. **Service settings**:
   - **Service name**: e.g. `gymbuddy-ai`
   - **Port**: `3000`
   - **CPU and memory**: e.g. 1 vCPU, 2 GB (adjust as needed).
4. **Health check** (important):
   - **Protocol**: HTTP
   - **Path**: `/api/health`
   - **Interval**: 10 seconds (or your preference)
   - **Timeout**: 5 seconds
   - **Unhealthy threshold**: 3
5. Create the service. App Runner will clone the repo, build the Docker image, and run the container. The first deployment may take several minutes.

### 2. Get the app URL

After the service status is **Running**, copy the **Default domain** (e.g. `xxxxx.us-east-1.awsapprunner.com`). Open it in a browser to use the app.

### 3. (Optional) Environment variables

If you add env vars later (e.g. for analytics or feature flags):

- In the App Runner service → **Configuration** tab → **Edit** → **Environment variables**, add key/value pairs.
- Redeploy if needed (e.g. trigger a new deployment from the **Deployments** tab or push a new commit if auto-deploy is on).

---

## Option B: Deploy from a container registry (ECR)

If you prefer to build the image yourself and push to Amazon ECR:

### 1. Build and tag the image

```bash
docker build -t gymbuddy-ai .
# Replace ACCOUNT_ID and REGION with your AWS account and region
docker tag gymbuddy-ai:latest ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/gymbuddy-ai:latest
```

### 2. Push to ECR

Create an ECR repository named `gymbuddy-ai`, authenticate Docker to ECR, and push:

```bash
aws ecr get-login-password --region REGION | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/gymbuddy-ai:latest
```

### 3. Create App Runner service from ECR

- **Repository type**: Container registry
- **Container image URI**: `ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/gymbuddy-ai:latest`
- **Port**: 3000
- **Health check path**: `/api/health`

Then configure service name, CPU/memory, and create the service.

---

## Option C: Source-based build (no Dockerfile)

App Runner can also build from source using a build spec instead of Docker:

1. **Runtime**: Managed runtime → **Node.js 22**.
2. **Build command**: `npm ci && npm run build`
3. **Run command**: `npm start`
4. **Build artifact**: Leave default (App Runner will use the built app).

Note: The app uses Next.js `output: "standalone"` and reads the `data/` folder at runtime. For source builds, ensure the `data/` directory is included in the repo and that the run environment has access to it. Using the **Dockerfile (Option A)** is recommended so the standalone server and `data/` are packaged correctly.

---

## Health check

The app exposes **GET /api/health**, which returns:

```json
{ "status": "ok", "service": "gymbuddy-ai" }
```

Configure App Runner’s health check to use **path** `/api/health` so the service is marked healthy when the app is ready to serve traffic.

---

## Post-deploy

- **Custom domain**: In App Runner → **Custom domains**, attach your domain and follow the DNS steps.
- **Auto-deploy**: If you connected GitHub, you can enable automatic deployments on push to your chosen branch.
- **Logs**: Use **Logs** in the App Runner console or CloudWatch Logs for the service to debug issues.

---

## Summary

| Item            | Value / action                          |
|-----------------|-----------------------------------------|
| Port            | 3000                                    |
| Health path     | `/api/health`                            |
| Node            | 22+ (Dockerfile uses `node:22-alpine`)  |
| Env vars       | None required for current feature set   |
| Data           | Bundled in image via Dockerfile (`data/`) |

For the smoothest experience, use **Option A** (GitHub + Dockerfile) and set the health check path to `/api/health`.
