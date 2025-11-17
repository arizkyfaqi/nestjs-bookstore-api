# Bookstore API (NestJS)

REST API untuk aplikasi **toko buku online**, menggunakan **NestJS**, **PostgreSQL**, dan fitur modern seperti JWT authentication, role-based access, upload cover buku, checkout, dan logging.

---

## Tech Stack

- Node.js + NestJS
- PostgreSQL
- TypeORM
- bcrypt (hash password)
- jsonwebtoken (JWT)
- winston (logging)
- multer + sharp (upload & resize image)
- Swagger (API docs)
- dotenv (env config)
- Redis (caching, rate limiting, single-device session)
- class-validator & class-transformer (DTO validation)

## Installation

### Clone Repository

```bash
git clone
cd nestjs-bookstore-api
npm install
```

### Setup Environment

Buat file .env di root project dan isi dengan konfigurasi berikut:

```
#DB
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_HOST=localhost
DATABASE_NAME="nestjs-bookstore"
DATABASE_SYNC=true
DATABASE_AUTOLOAD=true
PROFILE_API_KEY=somevalue
#JWT
JWT_SECRET=secretkey
JWT_TOKEN_AUDIENCE=localhost:3000
JWT_TOKEN_ISSUER=localhost:3000
JWT_ACCESS_TOKEN_TTL=3600
JWT_REFRESH_TOKEN_TTL=86400
#API VERSION
API_VERSION=0.1.1
#REDIS
REDIS_URL=redis://localhost:6379
```

### Setup Database

```
npm run typeorm migration:run
```

### Setup Database

```
npm run start:dev
```

## Swagger API Documentation

```
http://localhost:3000/api-docs
```
