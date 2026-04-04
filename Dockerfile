# ============================================================
# Stage 1: Build React Frontend
# ============================================================
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# Install dependencies first (better caching)
COPY legal-ui/package.json legal-ui/package-lock.json* ./
RUN npm ci

# Copy source and build
COPY legal-ui/ ./

# Build args for env vars baked into the frontend at build time
ARG VITE_API_URL=/api
ARG VITE_FIRM_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FIRM_ID=$VITE_FIRM_ID

RUN npm run build

# ============================================================
# Stage 2: Build .NET Backend
# ============================================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src

# Copy csproj and restore (better caching)
COPY legal/legal.csproj ./legal/
RUN dotnet restore ./legal/legal.csproj

# Copy all source
COPY legal/ ./legal/

# Publish release build
RUN dotnet publish ./legal/legal.csproj -c Release -o /app/publish --no-restore

# ============================================================
# Stage 3: Final Runtime Image
# ============================================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install curl for health checks and openssl for DataProtection key encryption
RUN apt-get update && apt-get install -y --no-install-recommends curl openssl && rm -rf /var/lib/apt/lists/*

# Copy published .NET app
COPY --from=backend-build /app/publish .

# Copy React build output into wwwroot
COPY --from=frontend-build /app/frontend/dist ./wwwroot/

# Create persistent directories (overlaid by Docker volumes at runtime)
# Generate a self-signed cert used to encrypt DataProtection key XML files at rest.
# The PFX is baked into the image (public cert only) — the volume stores the encrypted keys.
RUN mkdir -p /app/uploads /app/keys && \
    openssl req -x509 -newkey rsa:2048 -keyout /tmp/dp-key.pem -out /tmp/dp-cert.pem \
        -days 3650 -nodes -subj "/CN=LegalRO-DataProtection" && \
    openssl pkcs12 -export -out /app/dataprotection.pfx \
        -inkey /tmp/dp-key.pem -in /tmp/dp-cert.pem -passout pass:dp-internal && \
    rm /tmp/dp-key.pem /tmp/dp-cert.pem

# Environment
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "legal.dll"]
