# 🔧 Vercel Build Optimization - 250MB Limit Fix

## Problem
Vercel build pada sa greškom: **"Serverless Function has exceeded the unzipped maximum size of 250 MB"**

## Uzrok
APK fajlovi (212MB) u `public/` folderu se automatski uključuju u Next.js serverless function bundle i prelaze limit.

## Implementirano rešenje (prema Vercel dokumentaciji)

### ✅ 1. `next.config.js` - outputFileTracingExcludes
**Za Next.js projekte, ovo je ispravan način** (ne koristiti `excludeFiles` u `vercel.json`):

```javascript
experimental: {
  outputFileTracingExcludes: {
    '*': [
      './public/apk/**/*.apk',
      './private/apk/**/*.apk',
      '**/*.apk',
    ],
  },
}
```

**Zašto:** Next.js automatski koristi `outputFileTracing` da uključi samo potrebne fajlove. `outputFileTracingExcludes` eksplicitno isključuje APK fajlove iz bundle-a.

### ✅ 2. API Endpoint za serviranje APK fajlova
Kreiran `/api/public-apk` endpoint koji:
- Čita APK fajlove iz `public/` foldera **u runtime-u** (ne u build-u)
- Servira fajlove kao stream
- **NE uključuje APK fajlove u serverless function bundle**

**Zašto:** Prema Vercel dokumentaciji, statički fajlovi treba da se serviraju preko CDN-a ili API endpoint-a, ne da se uključuju u function bundle.

### ✅ 3. `.vercelignore` (opciono, dodatna zaštita)
Isključuje APK fajlove iz Vercel build procesa:
```
public/apk/**/*.apk
private/apk/**/*.apk
*.apk
```

**Napomena:** Za Next.js, ovo nije obavezno ako koristimo `outputFileTracingExcludes`, ali pruža dodatnu zaštitu.

## Prema Vercel dokumentaciji

### ✅ Ispravno za Next.js:
- ✅ Koristiti `outputFileTracingExcludes` u `next.config.js`
- ✅ **NE** koristiti `excludeFiles` u `vercel.json` (nije podržano za Next.js)

### ✅ Optimizacija statičkih fajlova:
- ✅ APK fajlovi se serviraju preko API endpoint-a (ne u bundle-u)
- ✅ Cache headers omogućavaju CDN caching
- ✅ Fajlovi se čitaju u runtime-u, ne u build-u

## Provera

Nakon deploy-a, proveri:
1. ✅ Build prošao bez greške (nema "250MB limit" greške)
2. ✅ Download link radi: `/api/public-apk?app=worker_app&file=worker_app-1.1.0-debug.apk`
3. ✅ Fajl se preuzima ispravno

## Alternativna rešenja (ako problem i dalje postoji)

### Opcija 1: GitHub Releases
- Upload APK na GitHub Releases
- Link ka GitHub Releases download URL-u
- Nema problema sa veličinom

### Opcija 2: External CDN
- Upload APK na S3/CloudFront/CDN
- Link ka CDN URL-u
- Najbolje performanse

### Opcija 3: Vercel Blob Storage
- Koristiti Vercel Blob Storage za velike fajlove
- Servira preko Vercel CDN
- Zahteva Vercel Pro plan

## Reference

- [Vercel Troubleshooting Guide](https://vercel.com/docs/functions/troubleshooting/serverless-function-size-limit)
- [Next.js outputFileTracing](https://nextjs.org/docs/app/api-reference/next-config-js/output#outputfiletracingincludes)
