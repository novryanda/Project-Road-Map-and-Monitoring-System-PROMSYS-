#!/bin/sh

# Set default if not provided
: "${NEXT_PUBLIC_API_URL:=http://localhost:3001}"

echo "Injecting runtime environment variables..."
echo "API URL: $NEXT_PUBLIC_API_URL"

# Find all JS files in .next and server.js, replace placeholder with actual URL
# We use | as a delimiter for sed because the URL contains /
find .next -type f -name "*.js" -exec sed -i "s|APP_NEXT_PUBLIC_API_URL_PLACEHOLDER|${NEXT_PUBLIC_API_URL}|g" {} +
sed -i "s|APP_NEXT_PUBLIC_API_URL_PLACEHOLDER|${NEXT_PUBLIC_API_URL}|g" server.js

echo "Injection completed. Starting Next.js..."

# Execute the CMD passed as arguments (usually 'node server.js')
exec "$@"
