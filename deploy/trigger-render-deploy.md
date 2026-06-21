# Deploy hook trigger (when GitHub secret not configured)

If pushes to `main` do not auto-deploy Render:

1. Render Dashboard → your service → Settings → Deploy Hook → copy URL
2. Add to local `.env` as `RENDER_DEPLOY_HOOK_URL=https://api.render.com/...`
3. Or add same URL to GitHub repo secret `RENDER_DEPLOY_HOOK_URL`

Then run:

```powershell
cd C:\Users\jshug\wealth-engine
node -e "import('./core/env.mjs').then(async m=>{const u=m.loadEnv().RENDER_DEPLOY_HOOK_URL;if(!u)throw new Error('Set RENDER_DEPLOY_HOOK_URL');const r=await fetch(u,{method:'POST'});console.log('status',r.status);})"
```

Verify after ~3 minutes:

```powershell
curl.exe -s -o NUL -w "%{http_code}" https://wealth-engine-0qlj.onrender.com/go/nda.html
```

Expect `200`.
