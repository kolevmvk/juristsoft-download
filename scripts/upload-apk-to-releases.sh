#!/bin/bash
# Skripta za upload APK-a na GitHub Releases
# Koristi: ./scripts/upload-apk-to-releases.sh worker_app 1.1.0

set -e

APP_ID="${1:-worker_app}"
VERSION="${2:-1.1.0}"
APK_PATH="private/apk/apps/${APP_ID}/${VERSION}.apk"
REPO="kolevmvk/juristsoft-download"

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
    echo "4. Postavite ga kao environment variable:"
    echo "   export GITHUB_TOKEN='your-token-here'"
    exit 1
fi

echo "📦 Upload APK na GitHub Releases"
echo "   App: $APP_ID"
echo "   Version: $VERSION"
echo "   File: $APK_PATH"
echo ""

# Proveri da li release već postoji
RELEASE_ID=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO/releases/tags/v$VERSION" | \
    jq -r '.id // empty')

if [ -z "$RELEASE_ID" ]; then
    echo "📝 Kreiranje novog release-a v$VERSION..."
    
    # Kreiraj release
    RESPONSE=$(curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/$REPO/releases" \
        -d "{
            \"tag_name\": \"v$VERSION\",
            \"name\": \"$APP_ID v$VERSION\",
            \"body\": \"APK build za $APP_ID verziju $VERSION\\n\\nDatum: $(date +%Y-%m-%d)\",
            \"draft\": false,
            \"prerelease\": false
        }")
    
    RELEASE_ID=$(echo "$RESPONSE" | jq -r '.id')
    
    if [ "$RELEASE_ID" = "null" ] || [ -z "$RELEASE_ID" ]; then
        echo "❌ Greška pri kreiranju release-a:"
        echo "$RESPONSE" | jq -r '.message // .'
        exit 1
    fi
    
    echo "✅ Release kreiran (ID: $RELEASE_ID)"
else
    echo "ℹ️  Release već postoji (ID: $RELEASE_ID)"
fi

# Upload APK
echo ""
echo "⬆️  Upload APK fajla..."
APK_NAME="${APP_ID}-${VERSION}.apk"

UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Content-Type: application/vnd.android.package-archive" \
    --data-binary "@$APK_PATH" \
    "https://uploads.github.com/repos/$REPO/releases/$RELEASE_ID/assets?name=$APK_NAME")

HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | tail -1)
RESPONSE_BODY=$(echo "$UPLOAD_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "201" ]; then
    DOWNLOAD_URL=$(echo "$RESPONSE_BODY" | jq -r '.browser_download_url')
    echo "✅ APK uspešno upload-ovan!"
    echo ""
    echo "📱 Download URL:"
    echo "   $DOWNLOAD_URL"
    echo ""
    echo "🌐 Release stranica:"
    echo "   https://github.com/$REPO/releases/tag/v$VERSION"
else
    echo "❌ Greška pri upload-u (HTTP $HTTP_CODE):"
    echo "$RESPONSE_BODY" | jq -r '.message // .' 2>/dev/null || echo "$RESPONSE_BODY"
    exit 1
fi

