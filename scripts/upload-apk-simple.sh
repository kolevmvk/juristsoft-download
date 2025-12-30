#!/bin/bash
# Jednostavna skripta za upload APK-a na GitHub Releases
# Koristi: ./scripts/upload-apk-simple.sh

set -e

APP_ID="worker_app"
VERSION="1.1.0"
APK_PATH="private/apk/apps/${APP_ID}/${VERSION}.apk"

echo "📦 Upload APK na GitHub Releases"
echo "   App: $APP_ID"
echo "   Version: $VERSION"
echo ""

# Proveri da li APK postoji
if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK fajl ne postoji: $APK_PATH"
    exit 1
fi

# Proveri da li je GITHUB_TOKEN postavljen
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN nije postavljen!"
    echo ""
    echo "Kreiraj GitHub Personal Access Token:"
    echo "1. Idite na: https://github.com/settings/tokens"
    echo "2. Kliknite 'Generate new token (classic)'"
    echo "3. Dajte mu 'repo' scope"
    echo "4. Postavite ga:"
    echo "   export GITHUB_TOKEN='your-token-here'"
    exit 1
fi

REPO="kolevmvk/juristsoft-download"
APK_NAME="${APP_ID}-${VERSION}.apk"

# Proveri da li release već postoji
echo "🔍 Proveravam da li release već postoji..."
RELEASE_ID=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO/releases/tags/v$VERSION" 2>/dev/null | \
    grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2 || echo "")

if [ -z "$RELEASE_ID" ]; then
    echo "📝 Kreiranje novog release-a v$VERSION..."
    
    # Kreiraj release (bez jq, koristi grep/sed)
    RESPONSE=$(curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/$REPO/releases" \
        -d "{
            \"tag_name\": \"v$VERSION\",
            \"name\": \"$APP_ID v$VERSION\",
            \"body\": \"APK build za $APP_ID verziju $VERSION\",
            \"draft\": false,
            \"prerelease\": false
        }")
    
    RELEASE_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    if [ -z "$RELEASE_ID" ]; then
        echo "❌ Greška pri kreiranju release-a"
        echo "$RESPONSE"
        exit 1
    fi
    
    echo "✅ Release kreiran (ID: $RELEASE_ID)"
else
    echo "ℹ️  Release već postoji (ID: $RELEASE_ID)"
fi

# Upload APK
echo ""
echo "⬆️  Upload APK fajla ($(du -h "$APK_PATH" | cut -f1))..."

UPLOAD_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Content-Type: application/vnd.android.package-archive" \
    --data-binary "@$APK_PATH" \
    "https://uploads.github.com/repos/$REPO/releases/$RELEASE_ID/assets?name=$APK_NAME")

HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$UPLOAD_RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "201" ]; then
    DOWNLOAD_URL=$(echo "$RESPONSE_BODY" | grep -o '"browser_download_url":"[^"]*"' | cut -d'"' -f4)
    echo "✅ APK uspešno upload-ovan!"
    echo ""
    echo "📱 Download URL:"
    echo "   $DOWNLOAD_URL"
    echo ""
    echo "🌐 Release stranica:"
    echo "   https://github.com/$REPO/releases/tag/v$VERSION"
else
    echo "❌ Greška pri upload-u (HTTP $HTTP_CODE):"
    echo "$RESPONSE_BODY"
    exit 1
fi

