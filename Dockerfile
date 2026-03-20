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

# Install curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy published .NET app
COPY --from=backend-build /app/publish .

# Copy React build output into wwwroot
COPY --from=frontend-build /app/frontend/dist ./wwwroot/

# Environment
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "legal.dll"]
