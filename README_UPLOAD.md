# 📦 Upload APK na GitHub Releases

Umesto direktnog commit-a velikog APK fajla (preko 100MB), koristimo **GitHub Releases**.

**GitHub Pages (`https://kolevmvk.github.io/juristsoft-download/`):** sajt se servira sa grane **`gh-pages`** (korenski `index.html`, plus `docs/index.html` u sync). Samo izmena `main/docs/index.html` **ne ažurira** živi sajt dok se isti sadržaj ne iskopira na `gh-pages` i push-uje (npr. `git show main:docs/index.html > index.html` na `gh-pages`).

---

## 🚀 Brzo uputstvo

### 1. Kreiraj GitHub Personal Access Token

1. Idite na: https://github.com/settings/tokens
2. Kliknite **"Generate new token (classic)"**
3. Dajte mu ime: `juristsoft-download-upload`
4. Selektujte scope: **`repo`** (full control of private repositories)
5. Kliknite **"Generate token"**
6. **Kopirajte token** (neće se više prikazati!)

### 2. Postavi token kao environment variable

```bash
export GITHUB_TOKEN='your-token-here'
```

Ili dodaj u `~/.bashrc` ili `~/.zshrc`:
```bash
echo 'export GITHUB_TOKEN="your-token-here"' >> ~/.bashrc
source ~/.bashrc
```

### 3. Pokreni skriptu

```bash
cd juristsoft-download
./scripts/upload-apk-simple.sh
```

---

## 📋 Detaljno uputstvo

### Opcija 1: Jednostavna skripta (preporučeno)

```bash
cd juristsoft-download
export GITHUB_TOKEN='your-token-here'
./scripts/upload-apk-simple.sh
```

**Šta radi:**
- Proverava da li release već postoji
- Ako ne postoji, kreira novi release
- Upload-uje APK fajl na release
- Prikazuje download URL

### Opcija 2: Napredna skripta (sa jq)

```bash
cd juristsoft-download
export GITHUB_TOKEN='your-token-here'
./scripts/upload-apk-to-releases.sh worker_app 1.1.0
```

**Parametri:**
- `worker_app` - ID aplikacije
- `1.1.0` - verzija

**Zahteva:** `jq` instaliran (`sudo apt-get install jq`)

---

## 🔄 Workflow za novu verziju

### 1. Build APK

```bash
cd worker_app
flutter build apk --release
```

### 2. Kopiraj APK

```bash
cd ..
VERSION="1.2.0"
cp worker_app/build/app/outputs/flutter-apk/app-release.apk \
   juristsoft-download/private/apk/apps/worker_app/${VERSION}.apk
```

### 3. Ažuriraj manifest

Otvori `juristsoft-download/private/apk/apps/apps.json` i dodaj:

```json
{
  "version": "1.2.0",
  "file": "1.2.0.apk",
  "date": "2025-12-24"
}
```

### 4. Upload na GitHub Releases

```bash
cd juristsoft-download
export GITHUB_TOKEN='your-token-here'
./scripts/upload-apk-simple.sh
```

**Ili ručno promeni verziju u skripti:**
```bash
# Uredi scripts/upload-apk-simple.sh
# Promeni VERSION="1.2.0"
```

### 5. Commit manifest (bez APK fajla)

```bash
cd juristsoft-download
git add private/apk/apps/apps.json
git commit -m "Add worker_app v1.2.0 to manifest"
git push
```

**APK fajl NE commit-uj** - on je na GitHub Releases!

---

## 🔗 Linkovi

- **GitHub Releases:** https://github.com/kolevmvk/juristsoft-download/releases
- **Download stranica:** https://juristsoft-download.vercel.app/apps
- **GitHub Tokens:** https://github.com/settings/tokens

---

## ⚠️ Troubleshooting

### Problem: "GITHUB_TOKEN nije postavljen"
```bash
export GITHUB_TOKEN='your-token-here'
```

### Problem: "APK fajl ne postoji"
Proveri putanju:
```bash
ls -lh juristsoft-download/private/apk/apps/worker_app/1.1.0.apk
```

### Problem: "401 Unauthorized"
- Proveri da li je token validan
- Proveri da li token ima `repo` scope
- Kreiraj novi token ako je potrebno

### Problem: "Release već postoji"
- Skripta će automatski koristiti postojeći release
- Ili kreiraj novu verziju (npr. `1.1.1`)

---

## 📝 Napomene

1. **APK fajlovi se NE commit-uju u git** - samo manifest (`apps.json`)
2. **APK fajlovi se upload-uju na GitHub Releases** - bez limita veličine
3. **Manifest se commit-uje** - da bi se prikazao na download stranici
4. **Vercel deploy** - automatski se deploy-uje nakon push-a

---

## 🎯 Primer kompletnog workflow-a

```bash
# 1. Build
cd worker_app && flutter build apk --release && cd ..

# 2. Kopiraj
VERSION="1.2.0"
cp worker_app/build/app/outputs/flutter-apk/app-release.apk \
   juristsoft-download/private/apk/apps/worker_app/${VERSION}.apk

# 3. Ažuriraj manifest (ručno)
nano juristsoft-download/private/apk/apps/apps.json

# 4. Upload na GitHub Releases
cd juristsoft-download
export GITHUB_TOKEN='your-token-here'
./scripts/upload-apk-simple.sh

# 5. Commit manifest
git add private/apk/apps/apps.json
git commit -m "Add worker_app v${VERSION} to manifest"
git push
```

---

**Gotovo!** 🎉 APK je sada dostupan na GitHub Releases i na download stranici.

