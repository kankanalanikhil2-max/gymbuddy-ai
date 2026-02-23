# Deploy GymBuddy AI on AWS App Runner (Free / Minimal Cost)

This guide is for **education use**: deploy with the **smallest size** and **minimal or no cost**. App Runner charges only for what you use (vCPU and memory × time). Keeping the service small and pausing when not needed keeps cost near zero.

---

## Cost overview (education-friendly)

- **App Runner** has no “always free” tier, but cost is **usage-based**:
  - Choose **0.25 vCPU** and **0.5 GB memory** (smallest).
  - You pay only while the service is **Running** (per second).
  - You can **pause** the service when not in use (e.g. after class) so it stops incurring cost.
- **GitHub**: free for public repos (you already pushed there).
- **No database or paid APIs** in this app, so no extra AWS services needed.

**Rough idea**: A few hours of “Running” per month with the smallest size is usually **under a few dollars**; pausing when not needed can keep it under **$1/month** or less for light use.

---

## What you need before starting

1. **AWS account** – [Create one](https://aws.amazon.com) if needed (credit card required; you can set a budget/billing alert).
2. **GitHub repo** – Your code is already at:  
   `https://github.com/kankanalanikhil2-max/gymbuddy-ai`
3. **About 10–15 minutes** for the first deployment.

---

## Step 1: Open App Runner in AWS Console

1. Log in to the **AWS Console**: https://console.aws.amazon.com
2. In the top search bar, type **App Runner** and open **App Runner**.
3. Choose **US East (N. Virginia) – us-east-1** from the top-right (other regions may not show all runtimes). You’ll use this region for all steps.
4. Click **Create service**.

---

## Step 2: Connect GitHub (source of your code)

1. Under **Source and deployment**, leave **Repository type** as **Source code repository**.
2. Click **Add new** next to “GitHub connection” (if you don’t have one yet):
   - A popup opens to **authorize AWS** with GitHub.
   - Choose **Only select repositories** and pick **kankanalanikhil2-max/gymbuddy-ai** (or your repo).
   - Complete the authorization.
3. Back in App Runner:
   - **Repository**: select **kankanalanikhil2-max/gymbuddy-ai**.
   - **Branch**: **main**.
4. **Deployment settings** – to avoid "runtime version is not supported", **do not use the configuration file**. Do this:
   - **Configuration source**: select **Configure all settings here** (not "Use a configuration file").
   - **Runtime**: open the dropdown and choose **Node.js 22** (or **Nodejs 22**). Do **not** choose Docker or any other runtime.
   - **Build command**: `npm install && npm run build`
   - **Start command**: `npm start`
5. Click **Next**.

---

## Step 3: Configure service (keep it minimal cost)

1. **Service name**: e.g. `gymbuddy-ai` (any name is fine).
2. **Port**: **3000** (your app listens on 3000).
3. **CPU and memory** (important for cost):
   - Choose the **smallest** option: **0.25 vCPU** and **0.5 GB memory**.
4. **Instance role**: Leave **Create new service role** (App Runner will create one).
5. **Auto scaling** (optional, for even lower cost):
   - **Min capacity**: **1** (one instance when running).
   - **Max capacity**: **1** (no scaling; keeps cost predictable).
6. Click **Next**.

---

## Step 4: Health check and security (required)

1. **Health check** (so App Runner knows the app is running):
   - **Protocol**: **HTTP**.
   - **Path**: **/api/health**
   - **Interval**: **10** seconds.
   - **Timeout**: **5** seconds.
   - **Unhealthy threshold**: **3**.
2. **Security**:
   - **Incoming traffic**: **Public** (so you can open the app in a browser).
3. Click **Next**.

---

## Step 5: Review and create

1. Review:
   - Source: GitHub, **main**, Node.js (or config file).
   - Service: **0.25 vCPU**, **0.5 GB**, port **3000**.
   - Health: **/api/health**.
2. Click **Create & deploy service**.

---

## Step 6: Wait for the first deployment

1. You’ll see the service in **Status: Creating**.
2. First time takes about **5–10 minutes** (clone repo → build Docker image → start container).
3. When **Status** is **Running**, deployment is done.

---

## Step 7: Open your app

1. On the service page, find **Default domain** (e.g. `xxxxx.us-east-1.awsapprunner.com`).
2. Click the link or copy it and open it in a browser.
3. You should see the **GymBuddy AI** landing page. You can go through onboarding and use the app.

---

## Pausing the service (to save cost when not in use)

When you’re done for the day (e.g. after class):

1. In **App Runner** → your service **gymbuddy-ai**.
2. Click **Pause** (top right).
3. Confirm. Status will change to **Paused** and you **stop being charged** while it’s paused.
4. To use it again: open the service and click **Resume**. Wait a minute or two for it to become **Running** again.

---

## Optional: Auto-deploy on git push

If you want every push to `main` to redeploy:

1. Service → **Configuration** tab.
2. Under **Source and deployment**, click **Edit**.
3. Enable **Automatic deployment** (deploy on push to **main**).
4. Save. Future pushes to **main** will trigger a new deployment.

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| **"Runtime version is not supported"** | Use **Configure all settings here** (not "Use a configuration file"). In **Runtime** choose **Node.js 22**. Use region **us-east-1** (N. Virginia). If it still fails, **delete the service**, create a **new** one, and on Step 2 set Configuration source = **Configure all settings here** and Runtime = **Node.js 22** before clicking Next. |
| **"Failed to execute build command"** | Open the service → **Deployments** → failed deployment → **View logs**. Fix the error shown there (e.g. out of memory → try **1 vCPU, 2 GB**; missing module → fix code and push). |
| Build fails (other) | In the service, open **Logs** (or **Deployments** → failed deployment → **View logs**). Ensure **Branch** is **main**. |
| Service “Unhealthy” | Confirm **Health check path** is exactly **/api/health** (no typo). After a code fix, trigger a new deployment. |
| 502 or can’t open app | Wait 2–3 minutes after status is **Running**. If it still fails, check **Logs** for errors. |
| GitHub connection missing | In **App Runner** → **Create service** → under GitHub, click **Add new** and authorize again; then pick the **gymbuddy-ai** repo. |

---

## Summary checklist

- [ ] AWS account created; region chosen (e.g. us-east-1).
- [ ] App Runner → Create service.
- [ ] Source: GitHub → **kankanalanikhil2-max/gymbuddy-ai**, branch **main**, **Docker**.
- [ ] Service: **0.25 vCPU**, **0.5 GB**, port **3000**.
- [ ] Health check path: **/api/health**.
- [ ] Create & deploy → wait until **Running**.
- [ ] Open **Default domain** in browser.
- [ ] (Optional) **Pause** when not in use to keep cost minimal.

For more options (custom domain, ECR, etc.), see **DEPLOYMENT.md**.
