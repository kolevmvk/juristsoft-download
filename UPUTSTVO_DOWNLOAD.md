# 📥 Uputstvo za Download APK fajlova sa sajta

## 🌐 Glavni način: `/apps` stranica (preporučeno)

### 1. Login
1. Otvori: **https://juristsoft-download.vercel.app/**
2. Unesi email i lozinku
3. Klikni "Uloguj se"

**Postojeći korisnici:**
- `srdjan@juristbiro.com` / `Test321!`
- `kolev@ellco.pro` / `MVK2112!`
- `filipovic@juristbiro.com` / `Test321!`

### 2. Download APK
1. Nakon login-a, automatski se preusmerava na `/apps` stranicu
2. Vidiš listu dostupnih aplikacija (worker_app, jurist_qr_app, itd.)
3. Za svaku aplikaciju vidiš dostupne verzije
4. Klikni na **"Download {version}"** dugme
5. APK fajl se automatski preuzima

**Primer:**
- Aplikacija: `worker_app`
- Verzije: `1.0.0`, `1.1.0`
- Klikni: **"Download 1.1.0"** → `worker_app-1.1.0.apk` se preuzima

---

## 🔗 Direktni linkovi (za napredne korisnike)

### Opcija 1: Javni endpoint (bez autentifikacije)
```
https://juristsoft-download.vercel.app/api/public-apk?app=worker_app&file=worker_app-1.1.0-debug.apk
```

**Parametri:**
- `app` - ID aplikacije (npr. `worker_app`)
- `file` - Ime fajla (npr. `worker_app-1.1.0-debug.apk`)

**Primer:**
```bash
# Preuzmi worker_app 1.1.0 debug verziju
curl -O "https://juristsoft-download.vercel.app/api/public-apk?app=worker_app&file=worker_app-1.1.0-debug.apk"
```

### Opcija 2: Zaštićeni endpoint (zahteva JWT token)
```
https://juristsoft-download.vercel.app/api/download?app=worker_app&version=1.1.0
```

**Kako koristiti:**
1. Prvo se uloguj na `/api/login` da dobiješ JWT token
2. Koristi token u `Authorization: Bearer {token}` header-u

**Primer sa curl:**
```bash
# 1. Login i dobij token
TOKEN=$(curl -X POST https://juristsoft-download.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"srdjan@juristbiro.com","password":"Test321!"}' \
  | jq -r '.token')

# 2. Download APK sa tokenom
curl -H "Authorization: Bearer $TOKEN" \
  -O "https://juristsoft-download.vercel.app/api/download?app=worker_app&version=1.1.0"
```

---

## 📋 Dostupne aplikacije i verzije

### worker_app
- `1.0.0.apk` (48MB)
- `1.1.0.apk` (212MB)
- `worker_app-1.1.0-debug.apk` (212MB) - debug verzija

### jurist_qr_app
- `1.0.1-arm64.apk` (16MB)
- `1.0.1-armeabi.apk` (14MB)
- `1.0.1-x86_64.apk` (17MB)

---

## 🛠️ Troubleshooting

### Problem: "Unauthorized" (401)
- **Uzrok:** Nisi ulogovan ili token je istekao
- **Rešenje:** Uloguj se ponovo na `/` stranici

### Problem: "File not found" (404)
- **Uzrok:** APK fajl ne postoji na serveru
- **Rešenje:** Proveri da li verzija postoji u `apps.json` manifestu

### Problem: Download ne počinje
- **Uzrok:** Browser blokira download ili veliki fajl
- **Rešenje:** 
  - Proveri browser download settings
  - Za velike fajlove (212MB), sačekaj da se download počne
  - Koristi direktni link u novom tab-u

### Problem: "Missing app or version" (400)
- **Uzrok:** Neispravni parametri u URL-u
- **Rešenje:** Proveri da li su `app` i `version` parametri ispravni

---

## 📱 Download na Android uređaju

### Metoda 1: Preko browser-a
1. Otvori browser na Android uređaju
2. Idi na: `https://juristsoft-download.vercel.app/apps`
3. Uloguj se
4. Klikni "Download" dugme
5. APK se preuzima u Downloads folder

### Metoda 2: Direktni link
1. Otvori link u browser-u:
   ```
   https://juristsoft-download.vercel.app/api/public-apk?app=worker_app&file=worker_app-1.1.0-debug.apk
   ```
2. Download počinje automatski
3. Nakon download-a, otvori fajl i instaliraj

**Napomena:** Možda ćeš morati da dozvoliš "Instalaciju iz nepoznatih izvora" u Android Settings.

---

## 🔐 Bezbednost

- **JWT token** se čuva u `localStorage` browser-a
- Token ističe nakon određenog vremena
- Za javni endpoint (`/api/public-apk`), token nije potreban
- Za zaštićeni endpoint (`/api/download`), token je obavezan

---

## 📝 Napomene

1. **Veličina fajlova:** Neki APK fajlovi su veliki (212MB), pa download može potrajati
2. **Cache:** APK fajlovi se cache-uju na CDN-u (max-age=31536000)
3. **Git LFS:** APK fajlovi su u Git LFS-u, ne u git repozitorijumu direktno
4. **Build:** APK fajlovi se NE uključuju u Next.js build (izbegava 250MB limit)

---

## 🎯 Brzi pristup

**Najlakši način:**
1. Otvori: https://juristsoft-download.vercel.app/
2. Login sa kredencijalima
3. Klikni "Download" dugme pored verzije koju želiš

**Gotovo!** 🎉
