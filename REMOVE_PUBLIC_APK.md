# 🚨 Preporuka: Ukloniti APK fajlove iz public/ foldera

## Problem
`public/` folder se **automatski uključuje** u Next.js build, što može uzrokovati da se APK fajlovi uključe u serverless function bundle uprkos `outputFileTracingExcludes`.

## Trenutna situacija
- `public/apk/apps/worker_app/worker_app-1.1.0-debug.apk` (212MB)
- Ukupno: 516MB APK fajlova (7 fajlova)

## Rešenje

### Opcija 1: Premestiti APK iz public/ u private/ (preporučeno)
```bash
# Premesti APK iz public/ u private/
mv public/apk/apps/worker_app/worker_app-1.1.0-debug.apk \
   private/apk/apps/worker_app/worker_app-1.1.0-debug.apk

# Ažuriraj index.html da koristi API endpoint
# (već koristi /api/public-apk koji sada proverava i private/)
```

### Opcija 2: Koristiti samo private/ folder
- Svi APK fajlovi u `private/` folderu
- API endpoint `/api/download` već servira iz `private/`
- API endpoint `/api/public-apk` sada proverava i `private/` i `public/`

### Opcija 3: External storage (najbolje za production)
- GitHub Releases
- S3/CloudFront
- Vercel Blob Storage

## Prednosti
✅ `private/` folder se NE uključuje u Next.js build automatski  
✅ API endpoint-i već rade sa `private/` folderom  
✅ Manje rizika od uključivanja u bundle  

## Napomena
`public/` folder je namenjen za statičke fajlove koji se serviraju direktno preko CDN-a. Za velike fajlove (APK), bolje je koristiti API endpoint-e.
