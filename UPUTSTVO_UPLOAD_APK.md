# 📦 Uputstvo za Upload APK-a na juristsoft-download

## 🎯 Kako funkcioniše

`juristsoft-download` je Next.js aplikacija deployovana na Vercel-u koja:
- Čita manifest fajl `private/apk/apps/apps.json`
- Prikazuje aplikacije i verzije na https://juristsoft-download.vercel.app/apps
- Servira APK fajlove iz `private/apk/apps/{app_id}/{version}.apk`

**Vercel je povezan sa git repozitorijumom** - svaki commit se automatski deploy-uje!

---

## 📋 Koraci za dodavanje nove verzije APK-a

### 1. Build Release APK

```bash
cd /home/ellkolle/git-project/Jurisoft/worker_app
flutter build apk --release
```

APK će biti kreiran u: `build/app/outputs/flutter-apk/app-release.apk`

### 2. Kopiraj APK u juristsoft-download folder

```bash
# Primer za worker_app verziju 1.1.0
cp worker_app/build/app/outputs/flutter-apk/app-release.apk \
   juristsoft-download/private/apk/apps/worker_app/1.1.0.apk
```

**Struktura foldera:**
```
juristsoft-download/private/apk/apps/
├── apps.json                    # Manifest fajl
├── worker_app/
│   ├── 1.0.0.apk                # Postojeća verzija
│   └── 1.1.0.apk                # Nova verzija
├── jurist_qr_app/
│   └── 1.0.1-arm64.apk
└── jurist_admin_app/
```

### 3. Ažuriraj manifest (apps.json)

Otvori `juristsoft-download/private/apk/apps/apps.json` i dodaj novu verziju:

```json
{
  "apps": [
    {
      "id": "worker_app",
      "name": "JuristSoft Worker App",
      "description": "Aplikacija za radnike.",
      "versions": [
        {
          "version": "1.0.0",
          "file": "1.0.0.apk",
          "date": "2025-11-23"
        },
        {
          "version": "1.1.0",
          "file": "1.1.0.apk",
          "date": "2025-12-24"
        }
      ]
    }
  ]
}
```

**Napomena:** `date` format je `YYYY-MM-DD`

### 4. Commit i Push u Git

```bash
cd /home/ellkolle/git-project/Jurisoft
git add juristsoft-download/private/apk/apps/worker_app/1.1.0.apk
git add juristsoft-download/private/apk/apps/apps.json
git commit -m "Add worker_app v1.1.0 APK"
git push
```

### 5. Vercel automatski deploy-uje

Nakon push-a, Vercel će automatski:
- Detektovati promene
- Build-ovati Next.js aplikaciju
- Deploy-ovati na https://juristsoft-download.vercel.app

**Vreme deploy-a:** ~1-2 minuta

---

## 🚀 Brza komanda (sve u jednom)

```bash
# 1. Build
cd worker_app && flutter build apk --release

# 2. Kopiraj i ažuriraj manifest
cd ..
VERSION="1.1.0"
DATE=$(date +%Y-%m-%d)
cp worker_app/build/app/outputs/flutter-apk/app-release.apk \
   juristsoft-download/private/apk/apps/worker_app/${VERSION}.apk

# 3. Ažuriraj apps.json (ručno ili kroz skriptu)
# ... otvori apps.json i dodaj novu verziju ...

# 4. Commit i push
git add juristsoft-download/private/apk/
git commit -m "Add worker_app v${VERSION} APK"
git push
```

---

## 📝 Primer za različite aplikacije

### Worker App
```bash
cp worker_app/build/app/outputs/flutter-apk/app-release.apk \
   juristsoft-download/private/apk/apps/worker_app/1.1.0.apk
```

### QR App
```bash
cp juristsoft_qr/build/app/outputs/flutter-apk/app-release.apk \
   juristsoft-download/private/apk/apps/jurist_qr_app/1.0.2.apk
```

### Admin App
```bash
cp admin_app/build/app/outputs/flutter-apk/app-release.apk \
   juristsoft-download/private/apk/apps/jurist_admin_app/1.0.0.apk
```

---

## ✅ Provera

1. **Lokalno testiranje:**
   ```bash
   cd juristsoft-download
   npm run dev
   # Otvori http://localhost:3000/apps
   ```

2. **Nakon deploy-a:**
   - Otvori https://juristsoft-download.vercel.app/apps
   - Login sa kredencijalima
   - Proveri da li se nova verzija prikazuje
   - Testiraj download

---

## 🔐 Login kredencijali

Za pristup `/apps` stranici, potrebno je login. Kreiranje korisnika:

```bash
cd juristsoft-download
node scripts/add-user.mjs "email@example.com" "Password123!"
```

**Postojeći korisnici:**
- `srdjan@juristbiro.com` / `Test321!`
- `kolev@ellco.pro` / `MVK2112!`
- `filipovic@juristbiro.com` / `Test321!`

---

## 📌 Napomene

1. **Vercel povezan sa Git-om:** Svaki commit se automatski deploy-uje
2. **APK fajlovi su veliki:** Git će ih pratiti, ali Vercel ima limit od 100MB po fajlu
3. **Manifest format:** `apps.json` mora biti validan JSON
4. **Version naming:** Preporučeno koristiti semver format (`1.0.0`, `1.1.0`, `2.0.0`)

---

## 🛠️ Troubleshooting

### Problem: APK se ne prikazuje na sajtu
- Proveri da li je `apps.json` validan JSON
- Proveri da li APK fajl postoji na putanji `private/apk/apps/{app_id}/{version}.apk`
- Proveri Vercel deploy logove

### Problem: Download ne radi
- Proveri JWT token (mora biti validan)
- Proveri da li fajl postoji na serveru
- Proveri Vercel serverless function logove

### Problem: Vercel deploy ne radi
- Proveri da li je Vercel povezan sa git repozitorijumom
- Proveri Vercel dashboard za greške
- Proveri `next.config.js` konfiguraciju

---

## 📚 Dodatne informacije

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Next.js Docs:** https://nextjs.org/docs
- **Git Repo:** `/home/ellkolle/git-project/Jurisoft/juristsoft-download`

