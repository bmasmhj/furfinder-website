# The Fur Finder API Documentation

## Base URL

- Development: `http://localhost:3000`
- Production: `https://furfinder.app` (example)

## API Response Format

All endpoints return JSON responses with the following format:

### Success Response

```json
{
  "data": {},
  "pagination": {}
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": []
}
```

## Support and Contact

- API and integration support: `support@thefurfinder.com`
- Partnerships and commercial enquiries: `partnerships@thefurfinder.com`
- Privacy and data rights enquiries: `privacy@thefurfinder.com`

---

## Public Endpoints

### Blogs

#### Get All Blogs

```
GET /api/public/blogs
```

**Query Parameters:**

- `category` (optional): Filter blogs by category
- `limit` (optional, default: 10): Number of results to return
- `offset` (optional, default: 0): Number of results to skip

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "excerpt": "string",
      "content": "string",
      "image_url": "string",
      "author": "string",
      "category": "string",
      "is_published": true,
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "pages": 3
  }
}
```

#### Get Blog by Slug

```
GET /api/public/blogs/:slug
```

**Response:**

```json
{
  "data": {
    /* blog object */
  },
  "related": [
    /* 3 related blogs */
  ]
}
```

### FAQs

#### Get All FAQs

```
GET /api/public/faqs
```

**Query Parameters:**

- `category` (optional): Filter FAQs by category

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "question": "string",
      "answer": "string",
      "category": "string",
      "order_index": 0,
      "is_published": true,
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

### Features

#### Get All Features

```
GET /api/public/features
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "icon": "string",
      "order_index": 0,
      "is_published": true,
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

### Pricing

#### Get All Pricing Plans

```
GET /api/public/pricing
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Free",
      "description": "string",
      "price": 0,
      "billing_period": "month",
      "features": ["feature1", "feature2"],
      "is_popular": false,
      "order_index": 0,
      "is_published": true,
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

### How It Works

#### Get All Steps

```
GET /api/public/how-it-works
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "step_number": 1,
      "title": "string",
      "description": "string",
      "image_url": "string",
      "order_index": 0,
      "is_published": true,
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

### Who It's For

#### Get All Items

```
GET /api/public/who-its-for
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "icon": "string",
      "order_index": 0,
      "is_published": true,
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

### Reunited Stories

#### Get All Reunited Stories

```
GET /api/public/reunited-stories
```

**Query Parameters:**

- `featured` (optional): Filter to featured stories only (`featured=true`)
- `limit` (optional, default: 12): Number of results to return
- `offset` (optional, default: 0): Number of results to skip

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "pet_name": "string",
      "pet_type": "string",
      "story_title": "string",
      "story_content": "string",
      "image_url": "string",
      "reunited_date": "timestamp",
      "is_featured": false,
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 12,
    "offset": 0,
    "pages": 5
  }
}
```

---

## Admin Endpoints

### Admin Blogs

#### Get All Blogs (Admin)

```
GET /api/admin/blogs
```

**Query Parameters:**

- `published` (optional): Filter by published status (`published=true`)

#### Create Blog

```
POST /api/admin/blogs
```

**Request Body:**

```json
{
  "title": "string (required)",
  "slug": "string (required)",
  "excerpt": "string (required)",
  "content": "string (required)",
  "image_url": "string (optional)",
  "author": "string (required)",
  "category": "string (required)",
  "is_published": boolean
}
```

#### Get Blog by ID

```
GET /api/admin/blogs/:id
```

#### Update Blog

```
PUT /api/admin/blogs/:id
```

**Request Body:** (all fields optional - only changed fields need to be provided)

```json
{
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "content": "string",
  "image_url": "string",
  "author": "string",
  "category": "string",
  "is_published": boolean
}
```

#### Delete Blog

```
DELETE /api/admin/blogs/:id
```

### Admin FAQs

#### Get All FAQs (Admin)

```
GET /api/admin/faqs
```

**Query Parameters:**

- `category` (optional): Filter FAQs by category

#### Create FAQ

```
POST /api/admin/faqs
```

**Request Body:**

```json
{
  "question": "string (required)",
  "answer": "string (required)",
  "category": "string (required)",
  "order_index": number,
  "is_published": boolean
}
```

#### Get FAQ by ID

```
GET /api/admin/faqs/:id
```

#### Update FAQ

```
PUT /api/admin/faqs/:id
```

#### Delete FAQ

```
DELETE /api/admin/faqs/:id
```

### Admin Features

#### Get All Features (Admin)

```
GET /api/admin/features
```

#### Create Feature

```
POST /api/admin/features
```

**Request Body:**

```json
{
  "title": "string (required)",
  "description": "string (required)",
  "icon": "string (optional)",
  "order_index": number,
  "is_published": boolean
}
```

#### Get Feature by ID

```
GET /api/admin/features/:id
```

#### Update Feature

```
PUT /api/admin/features/:id
```

#### Delete Feature

```
DELETE /api/admin/features/:id
```

### Admin Pricing

#### Get All Pricing Plans (Admin)

```
GET /api/admin/pricing
```

#### Create Pricing Plan

```
POST /api/admin/pricing
```

**Request Body:**

```json
{
  "name": "string (required)",
  "description": "string",
  "price": number (required),
  "billing_period": "string (required)",
  "features": ["array of strings (required)"],
  "is_popular": boolean,
  "order_index": number,
  "is_published": boolean
}
```

#### Get Pricing by ID

```
GET /api/admin/pricing/:id
```

#### Update Pricing

```
PUT /api/admin/pricing/:id
```

#### Delete Pricing

```
DELETE /api/admin/pricing/:id
```

### Admin How It Works

#### Get All Steps (Admin)

```
GET /api/admin/how-it-works
```

#### Create Step

```
POST /api/admin/how-it-works
```

**Request Body:**

```json
{
  "step_number": number (required),
  "title": "string (required)",
  "description": "string (required)",
  "image_url": "string (optional)",
  "order_index": number,
  "is_published": boolean
}
```

#### Get Step by ID

```
GET /api/admin/how-it-works/:id
```

#### Update Step

```
PUT /api/admin/how-it-works/:id
```

#### Delete Step

```
DELETE /api/admin/how-it-works/:id
```

### Admin Who It's For

#### Get All Items (Admin)

```
GET /api/admin/who-its-for
```

#### Create Item

```
POST /api/admin/who-its-for
```

**Request Body:**

```json
{
  "title": "string (required)",
  "description": "string (required)",
  "icon": "string (optional)",
  "order_index": number,
  "is_published": boolean
}
```

#### Get Item by ID

```
GET /api/admin/who-its-for/:id
```

#### Update Item

```
PUT /api/admin/who-its-for/:id
```

#### Delete Item

```
DELETE /api/admin/who-its-for/:id
```

### Admin Reunited Stories

#### Get All Reunited Stories (Admin)

```
GET /api/admin/reunited-stories
```

**Query Parameters:**

- `featured` (optional): Filter to featured stories only

#### Create Reunited Story

```
POST /api/admin/reunited-stories
```

**Request Body:**

```json
{
  "pet_name": "string (required)",
  "pet_type": "string (required)",
  "story_title": "string (required)",
  "story_content": "string (required)",
  "image_url": "string (optional)",
  "reunited_date": "timestamp (optional)",
  "is_featured": boolean
}
```

#### Get Story by ID

```
GET /api/admin/reunited-stories/:id
```

#### Update Story

```
PUT /api/admin/reunited-stories/:id
```

#### Delete Story

```
DELETE /api/admin/reunited-stories/:id
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK` - Successful GET, PUT
- `201 Created` - Successful POST
- `400 Bad Request` - Missing or invalid parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "error": "Error message describing what went wrong",
  "details": []
}
```

---

## Environment Variables

The following environment variables are required:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_API_URL` - Public API URL (optional, defaults to current origin)

---

## Frontend Usage Examples

### Fetching Data with Server-Side Rendering (SSR)

```typescript
// Example: Getting blogs in a Server Component
async function getBlogPosts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/public/blogs?limit=10`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  // render posts
}
```

---

## Notes for Developers

1. **Caching**: All SSR data fetches use `next: { revalidate: 3600 }` for 1-hour caching
2. **Admin Endpoints**: Implement authentication/authorization before using in production
3. **Pagination**: Use `limit` and `offset` for paginated endpoints
4. **Published Content**: Public endpoints only return `is_published: true` items
5. **Ordering**: Features, pricing, and steps are ordered by `order_index`
6. **Featured Content**: Reunited stories can be marked as `is_featured` for homepage display
