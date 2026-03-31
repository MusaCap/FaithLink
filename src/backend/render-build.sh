#!/usr/bin/env bash
set -e

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🗄️ Syncing database schema..."
npx prisma db push --skip-generate --accept-data-loss || echo "⚠️ db push had warnings, continuing..."

echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️ Seed skipped (may already be seeded)"

echo "✅ Build complete!"
