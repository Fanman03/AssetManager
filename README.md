# AssetManager
A simple, locally-hosted asset management platform

## Setup
AssetManager is designed to run as a Docker container. The following docker-compose file can be used as a starting point.
```yaml
version: '3.8'
services:
  assetmanager:
    image: jacklrpendleton/assetmanager:2.0.0
    ports:
      - '3002:3002'
    environment:
      - MONGODB_URI=
      - ADMIN_PASSWORD=
      - JWT_SECRET=
      - NEXT_PUBLIC_BASE_DOMAIN="https://assets.example.com"
      - NEXT_PUBLIC_APP_NAME="Asset Management"
      - NEXT_PUBLIC_TAG_URL="Example LLC"
    restart: unless-stopped
```
All that's needed to run the app is an empty MongoDB database named `asset-db` containing a collection named `assets`. 