# Bookstore API (NestJS)

REST API untuk aplikasi **toko buku online**, menggunakan **NestJS**, **PostgreSQL**, dan fitur seperti JWT authentication, role-based access, upload cover buku, checkout, payment dan logging.

---

## Fitur Utama

- **Authentication & Authorization**: JWT dengan role-based access control (Admin & Customer)
- **Manajemen Buku**: CRUD buku dengan upload dan resize cover image
- **Shopping Cart**: Tambah/hapus/update item di keranjang
- **Checkout & Payment**: Proses checkout dengan status pembayaran
- **Admin Dashboard**: Laporan penjualan dan manajemen transaksi
- **Rate Limiting**: Proteksi API dengan Redis-based rate limiting
- **Session Management**: Single-device session menggunakan Redis
- **Error Logging**: Winston logger untuk tracking error
- **Swagger Documentation**: API docs interaktif

## Tech Stack

- **Runtime**: Node.js
- **Framework**: NestJS 11+
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt (password hashing)
- **Caching & Sessions**: Redis (ioredis)
- **File Upload**: Multer + Sharp (image processing)
- **Validation**: class-validator & class-transformer
- **Logging**: Winston
- **API Documentation**: Swagger
- **Environment**: dotenv

## Installation

### Clone Repository

```bash
git clone https://github.com/arizkyfaqi/nestjs-bookstore-api.git
cd nestjs-bookstore-api
npm install
```

### Setup Environment

Buat file .env di root project dan isi dengan konfigurasi berikut:

```
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/nestjs-bookstore
DATABASE_SYNC=false
DATABASE_AUTOLOAD=true

# JWT
JWT_SECRET=your-secret-key
JWT_TOKEN_AUDIENCE=localhost:3000
JWT_TOKEN_ISSUER=localhost:3000
JWT_ACCESS_TOKEN_TTL=3600
JWT_REFRESH_TOKEN_TTL=86400

# API
API_VERSION=1.0.0
NODE_ENV=development
PORT=3000

# Redis
REDIS_URL=redis://localhost:6379
CACHE_TTL=300

# Payment Webhook
PAYMENT_WEBHOOK_SECRET=your-payment-secret
```

### Setup Database

```
npm run migration:run
```

### Running Application

Development

```
npm run start:dev
```

Production

```
npm run build
npm run start:prod
```

## API Documentation

```
http://localhost:3000/api-docs
```

## Live Demo

- [Api Docs](https://nestjs-bookstore-api-production.up.railway.app/api-docs)

## Project Structure

```
src/
├── auth/ # Authentication & JWT strategy
├── books/ # Book management
├── cart/ # Shopping cart
├── transactions/ # Orders & payment status
├── users/ # User management
├── payments/ # Payment processing
├── reports/ # Sales reports
├── uploads/ # File upload handling
├── common/ # Filters, interceptors
├── config/ # Configuration files
├── shared/ # Redis, Logger services
├── migrations/ # Database migrations
└── utils/ # DTOs, interfaces, constants
```

## Authentication

```
Authorization: Bearer <your-jwt-token>
```

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Authors

- [@arizkyfaqi](https://www.github.com/arizkyfaqi)
