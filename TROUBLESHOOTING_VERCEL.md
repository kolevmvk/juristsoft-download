# 🔧 Troubleshooting: Vercel Build Error - Serverless Function Size Limit

## Problem
```
Error: Serverless Function has exceeded the unzipped maximum size of 250 MB
```

## Uzrok
Vercel ima limit od **250MB** za unzipped serverless function size. APK fajlovi u `public/` folderu se automatski uključuju u build i prelaze limit.

## Rešenje

### 1. Konfiguracija `next.config.js`
- Dodato `outputFileTracingExcludes` da isključi APK fajlove iz bundle-a
- APK fajlovi se NE uključuju u serverless function build

### 2. API Endpoint za Download
- Kreiran `/api/public-apk` endpoint koji servira APK fajlove iz `public/` foldera
- Fajlovi se serviraju preko API-ja, ne direktno iz `public/` foldera
- API endpoint nije uključen u build bundle

### 3. `.vercelignore` fajl
- Isključuje APK fajlove iz Vercel build procesa
- Sprečava da se veliki fajlovi uključe u deployment

### 4. `vercel.json` konfiguracija
- Konfigurisan za Next.js framework
- Dodati cache headers za APK fajlove

## Struktura

```
public/apk/apps/worker_app/
├── index.html                    # Download stranica (koristi API endpoint)
└── worker_app-1.1.0-debug.apk   # APK fajl (servira se preko API-ja)

pages/api/
└── public-apk.js                 # API endpoint za serviranje APK fajlova
```

## Kako funkcioniše

1. **Korisnik klikne na download link** u `index.html`
2. **Link vodi na** `/api/public-apk?app=worker_app&file=worker_app-1.1.0-debug.apk`
3. **API endpoint** čita fajl iz `public/apk/apps/worker_app/` foldera
4. **Fajl se servira** kao stream, bez uključivanja u build bundle

## Prednosti

✅ APK fajlovi se NE uključuju u serverless function build  
✅ Build size ostaje ispod 250MB limita  
✅ APK fajlovi se i dalje serviraju preko Vercel-a  
✅ Cache headers omogućavaju CDN caching  

## Alternativna rešenja

### Opcija 1: GitHub Releases (preporučeno za production)
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

## Provera

Nakon deploy-a, proveri:
1. Build prošao bez greške
2. Download link radi: `/api/public-apk?app=worker_app&file=worker_app-1.1.0-debug.apk`
3. Fajl se preuzima ispravno

## Napomene

- APK fajlovi su i dalje u `public/` folderu (za lokalni development)
- U production, fajlovi se serviraju preko API endpoint-a
- Git LFS se koristi za version control (ne utiče na Vercel build)
