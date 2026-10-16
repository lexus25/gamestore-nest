# Publish Vue + NestJS to Azure

Use the separate Container App `gamestore-vue-nest`. Do not update the existing
C# application `gamestore-api` or its image.

From the repository root, with Docker Desktop running and Azure CLI signed in:

```sh
docker build --platform linux/amd64 -t gamestorelexus.azurecr.io/gamestore-vue-nest:v2 .
az acr login --name gamestorelexus
docker push gamestorelexus.azurecr.io/gamestore-vue-nest:v2
```

In Azure's Container App creation form:

- Name: `gamestore-vue-nest`
- Registry: `gamestorelexus`
- Image: `gamestore-vue-nest`
- Tag: `v2`
- Command and arguments: leave empty (use the image defaults).
- Add the Supabase Session pooler URL as `DATABASE_URL`, preferably referencing
  an Azure Container Apps secret. Never commit the URL or bake it into the image.
  Supabase credentials configured in Codex are not transferred to Azure.
- Enable ingress, allow traffic from anywhere, transport HTTP/Auto, target port
  `3000`. Keep insecure HTTP disabled; use the assigned HTTPS URL.
- For Consumption hosting, use minimum replicas `0` and maximum `1` initially.
  Azure resources can incur charges; this is not a guarantee of free hosting.

The container applies the committed Prisma migrations before starting NestJS.
The database must be reachable and the supplied account must be allowed to apply
the schema. If startup fails, inspect the new app's console logs without sharing
credentials.

Open the Application URL: `/` redirects in Vue to `/games`. Refreshing `/games`,
`/about`, or `/games/123` serves the Vue application. In this combined image,
REST endpoints live under `/backend` (e.g. `/backend/games` and
`/backend/health`); Swagger remains at `/api`. Assets and API share one origin.
Check `/backend/health` and create/read/update/delete a temporary game through
the UI to verify the deployment, then delete the temporary record.

For local development without a `public/index.html`, NestJS retains its original
unprefixed endpoints. Run Vue with `VITE_API_URL=http://localhost:3000` and
`npm run dev` from `frontend/`; run NestJS separately from the repository root.

GitHub Actions now targets the new image and app. Existing Azure OIDC bindings
must have access to the registry and new app. The app must exist before that
workflow's `az containerapp update` can succeed.
