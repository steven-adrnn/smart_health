# **Dokumentasi API Proyek**

## **1. Otentikasi**
Proyek ini menggunakan **Supabase Auth** untuk otentikasi pengguna. Setiap permintaan API yang memerlukan otentikasi harus menyertakan token JWT yang valid di header `Authorization`.

### **Cara Menggunakan Otentikasi**
- **Header**:  
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Token JWT**: Diperoleh setelah pengguna berhasil login melalui endpoint `/api/auth/login`.
- **Refresh Token**: Token JWT memiliki masa berlaku terbatas. Gunakan endpoint `/api/auth/refresh` untuk memperbarui token.

---


## **2. Endpoint API**

### **2.1. Endpoint Supabase**
Supabase menyediakan REST API untuk mengakses database dan layanan lainnya. Berikut adalah endpoint utama yang digunakan:

#### **2.1.1. Auth**
- **URL**: `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1`
- **Operasi**:
  - **Login**:  
    ```http
    POST /token?grant_type=password
    ```
    - **Body**:
      ```json
      {
        "email": "user@example.com",
        "password": "password123"
      }
      ```
    - **Respons**:
      ```json
      {
        "access_token": "<JWT_TOKEN>",
        "refresh_token": "<REFRESH_TOKEN>",
        "expires_in": 3600
      }
      ```

  - **Refresh Token**:  
    ```http
    POST /token?grant_type=refresh_token
    ```
    - **Body**:
      ```json
      {
        "refresh_token": "<REFRESH_TOKEN>"
      }
      ```
    - **Respons**: Sama seperti login.

    ### **1.1. Login**
    ```javascript
    async function login(email, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
        console.log('Login successful:', data);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
    } else {
        console.error('Login failed:', data);
    }
    }

    // Contoh penggunaan
    login('user@example.com', 'password123');
    ```

    ### **1.2. Logout**
    ```javascript
    async function logout() {
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });
    const data = await response.json();
    if (response.ok) {
        console.log('Logout successful:', data);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    } else {
        console.error('Logout failed:', data);
    }
    }

    // Contoh penggunaan
    logout();
    ```

#### **2.1.2. Database**
- **URL**: `https://<SUPABASE_PROJECT_REF>.supabase.co/rest/v1`
- **Operasi**:
  - **Mengambil Data**:  
    ```http
    GET /<TABLE_NAME>?select=*
    ```
    - **Header**:  
      ```http
      apikey: <SUPABASE_ANON_KEY>
      Authorization: Bearer <JWT_TOKEN>
      ```
    - **Respons**: Array data dari tabel.

  - **Menambah Data**:  
    ```http
    POST /<TABLE_NAME>
    ```
    - **Body**: Data yang akan ditambahkan.
    - **Respons**: Data yang berhasil ditambahkan.

---

### **2.2. Endpoint Custom**

#### **2.2.1. `/api/products`**
- **URL**: `/api/products`
- **Operasi**:
  - **Mengambil Semua Produk**:  
    ```http
    GET /api/products
    ```
    - **Respons**:
      ```json
      [
        {
          "id": 1,
          "name": "Product A",
          "price": 10000,
          "stock": 50
        }
      ]
      ```

  - **Menambah Produk Baru**:  
    ```http
    POST /api/products
    ```
    - **Body**:
      ```json
      {
        "name": "Product B",
        "price": 15000,
        "stock": 30
      }
      ```
    - **Respons**:
      ```json
      {
        "id": 2,
        "message": "Product added successfully"
      }
      ```

#### **2.2.2. `/api/addresses`**
- **URL**: `/api/addresses`
- **Operasi**:
  - **Mengambil Alamat Pengguna**:  
    ```http
    GET /api/addresses
    ```
    - **Header**:  
      ```http
      Authorization: Bearer <JWT_TOKEN>
      ```
    - **Respons**:
      ```json
      [
        {
          "id": 1,
          "user_id": "123",
          "address": "Jl. Contoh No. 123"
        }
      ]
      ```

  - **Menambah Alamat Baru**:  
    ```http
    POST /api/addresses
    ```
    - **Body**:
      ```json
      {
        "address": "Jl. Baru No. 456"
      }
      ```
    - **Respons ```json
      {
        "id": 2,
        "message": "Address added successfully"
      }
      ```

#### **2.2.3. `/api/auth`**
- **URL**: `/api/auth`
- **Operasi**:
  - **Login Pengguna**:  
    ```http
    POST /api/auth/login
    ```
    - **Body**:
      ```json
      {
        "email": "user@example.com",
        "password": "password123"
      }
      ```
    - **Respons**:
      ```json
      {
        "access_token": "<JWT_TOKEN>",
        "refresh_token": "<REFRESH_TOKEN>"
      }
      ```

  - **Logout Pengguna**:  
    ```http
    POST /api/auth/logout
    ```
    - **Header**:  
      ```http
      Authorization: Bearer <JWT_TOKEN>
      ```
    - **Respons**:
      ```json
      {
        "message": "Logout successful"
      }
      ```

#### **2.2.4. `/api/forum`**
- **URL**: `/api/forum`
- **Operasi**:
  - **Mengambil Semua Postingan**:  
    ```http
    GET /api/forum
    ```
    - **Respons**:
      ```json
      [
        {
          "id": 1,
          "title": "Post A",
          "content": "This is the content of Post A"
        }
      ]
      ```

  - **Menambah Postingan Baru**:  
    ```http
    POST /api/forum
    ```
    - **Body**:
      ```json
      {
        "title": "Post B",
        "content": "This is the content of Post B"
      }
      ```
    - **Respons**:
      ```json
      {
        "id": 2,
        "message": "Post added successfully"
      }
      ```

  - **Menambah Komentar**:  
    ```http
    POST /api/forum/{postId}/comments
    ```
    - **Body**:
      ```json
      {
        "content": "This is a comment"
      }
      ```
    - **Respons**:
      ```json
      {
        "id": 1,
        "message": "Comment added successfully"
      }
      ```

  - **Like Postingan**:  
    ```http
    POST /api/forum/{postId}/like
    ```
    - **Respons**:
      ```json
      {
        "message": "Post liked successfully"
      }
      ```

#### **2.2.5. `/api/points`**
- **URL**: `/api/points`
- **Operasi**:
  - **Mengambil Poin Pengguna**:  
    ```http
    GET /api/points
    ```
    - **Header**:  
      ```http
      Authorization: Bearer <JWT_TOKEN>
      ```
    - **Respons**:
      ```json
      {
        "points": 100
      }
      ```

  - **Menambah Poin**:  
    ```http
    POST /api/points/add
    ```
    - **Body**:
      ```json
      {
        "amount": 50
      }
      ```
    - **Respons**:
      ```json
      {
        "message": "Points added successfully"
      }
      ```

#### **2.2.6. `/api/recipes`**
- **URL**: `/api/recipes`
- **Operasi**:
  - **Mengambil Semua Resep**:  
    ```http
    GET /api/recipes
    ```
    - **Respons**:
      ```json
      [
        {
          "id": 1,
          "title": "Recipe A",
          "ingredients": ["Ingredient 1", "Ingredient 2"]
        }
      ]
      ```

  - **Menambah Resep Baru**:  
    ```http
    POST /api/recipes
    ```
    - **Body**:
      ```json
      {
        "title": "Recipe B",
        "ingredients": ["Ingredient 3", "Ingredient 4"]
      }
      ```
    - **Respons**:
      ```json
      {
        "id": 2,
        "message": "Recipe added successfully"
      }
      ```

#### **2.2.7. `/api/reviews`**
- **URL**: `/api/reviews`
- **Operasi**:
  - **Mengambil Semua Ulasan**:  
    ```http
    GET /api/reviews
    ```
    - **Respons**:
      ```json
      [
        {
          "id": 1,
          "product_id": 1,
          "rating": 5,
          "comment": "Excellent product!"
        }
      ]
      ```

  - **Menambah Ulasan Baru**:  
    ```http
    POST /api/reviews
    ```
    - **Body**:
      ```json
      {
        "product_id": 1,
        "rating": 4,
        "comment": "Very good, but could be improved."
      }
      ```
    - **Respons**:
      ```json
      {
        "id": 2,
        "message": "Review added successfully"
      }
      ```

---

## **3. Pesan Kesalahan dan Kode Status**
Dokumentasi ini juga mencakup beberapa pesan kesalahan umum dan kode status yang mungkin Anda temui saat menggunakan API:

- **400 Bad Request**: Permintaan tidak valid.
- **401 Unauthorized**: Token tidak valid atau tidak ada.
- **404 Not Found**: Endpoint tidak ditemukan.
- **500 Internal Server Error**: Terjadi kesalahan di server.

---

## **4. Contoh Kode**
Berikut adalah contoh kode untuk menggunakan API dalam aplikasi Anda:

### **Mengambil Produk**
```javascript
async function fetchProducts() {
  const response = await fetch('/api/products', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${your_jwt_token}`
    }
  });
  const data = await response.json();
  console.log(data);
}
```

### **Menambah Produk**
```javascript
async function addProduct(product) {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${your_jwt_token}`
    },
    body: JSON.stringify(product)
  });
  const data = await response.json();
  console.log(data);
}
```

---

## **5. Kesimpulan**
Dokumentasi API ini memberikan gambaran menyeluruh tentang cara menggunakan endpoint API dalam proyek Anda. Pastikan untuk mengikuti petunjuk otentikasi dan format permintaan/respons yang telah dijelaskan. Jika ada pertanyaan lebih lanjut atau jika Anda memerlukan penjelasan tambahan, silakan beri tahu saya.


