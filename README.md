# **Dokumentasi API Proyek**
### Steven Adrian Corne - 18222101
### https://smart-health-tst.up.railway.app

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

    #### **Mengambil Semua Produk**
    ```javascript
    async function fetchProducts() {
    const response = await fetch('/api/products', {
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });
    const data = await response.json();
    if (response.ok) {
        console.log('Products:', data);
    } else {
        console.error('Failed to fetch products:', data);
    }
    }

    // Contoh penggunaan
    fetchProducts();
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

    #### **Menambah Produk Baru**
    ```javascript
    async function addProduct(product) {
    const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(product)
    });
    const data = await response.json();
    if (response.ok) {
        console.log('Product added:', data);
    } else {
        console.error('Failed to add product:', data);
    }
    }

    // Contoh penggunaan
    addProduct({ name: 'Product B', price: 15000, stock: 30 });
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
    #### **Mengambil Alamat Pengguna**
    ```javascript
    async function fetchAddresses() {
    const response = await fetch('/api/addresses', {
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });
    const data = await response.json();
    if (response.ok) {
        console.log('Addresses:', data);
    } else {
        console.error('Failed to fetch addresses:', data);
    }
    }

    // Contoh penggunaan
    fetchAddresses();
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

    #### **Menambah Alamat Baru**
    ```javascript
    async function addAddress(address) {
    const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(address)
    });
    const data = await response.json();
    if (response.ok) {
        console.log('Address added:', data);
    } else {
        console.error('Failed to add address:', data);
    }
    }

    // Contoh penggunaan
    addAddress({ address: 'Jl. Baru No. 456' });
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

    ### **Login**
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
    
    ### **Logout**
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
    
    #### **Mengambil Semua Postingan**
    ```javascript
    async function fetchForumPosts() {
    const response = await fetch('/api/forum', {
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });
    const data = await response.json();
    if (response.ok) {
        console.log('Forum posts:', data);
    } else {
        console.error('Failed to fetch forum posts:', data);
    }
    }

    // Contoh penggunaan
    fetchForumPosts();
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
    
    #### **Menambah Postingan Baru**
    ```javascript
    async function addForumPost(post) {
    const response = await fetch('/ api/forum', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(post)
    });
    const data = await response.json();
    if (response.ok) {
        console.log('Post added:', data);
    } else {
        console.error('Failed to add post:', data);
    }
    }

    // Contoh penggunaan
    addForumPost({ title: 'Post B', content: 'This is the content of Post B' });
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
    
    #### **Menambah Komentar**
    ```javascript
    async function addComment(postId, comment) {
    const response = await fetch(`/api/forum/${postId}/comments`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(comment)
    });
    const data = await response.json();
    if (response.ok) {
        console.log('Comment added:', data);
    } else {
        console.error('Failed to add comment:', data);
    }
    }

    // Contoh penggunaan
    addComment(1, { content: 'This is a comment' });
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
    
    #### **Like Postingan**
    ```javascript
    async function likePost(postId) {
    const response = await fetch(`/api/forum/${postId}/like`, {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });
    const data = await response.json();
    if (response.ok) {
        console.log('Post liked:', data);
    } else {
        console.error('Failed to like post:', data);
    }
    }

    // Contoh penggunaan
    likePost(1);
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
    
    #### **Mengambil Poin Pengguna**
    ```javascript
    async function fetchUser Points() {
    const response = await fetch('/api/points', {
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });
    const data = await response.json();
    if (response.ok) {
        console.log('User  points:', data);
    } else {
        console.error('Failed to fetch user points:', data);
    }
    }

    // Contoh penggunaan
    fetchUser Points();
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
    
    #### **Menambah Poin**
    ```javascript
    async function addPoints(amount) {
    const response = await fetch('/api/points/add', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ amount })
    });
    const data = await response.json();
    if (response.ok) {
        console.log('Points added:', data);
    } else {
        console.error('Failed to add points:', data);
    }
    }

    // Contoh penggunaan
    addPoints(50);
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
    
    #### **Mengambil Semua Resep**
    ```javascript
    async function fetchRecipes() {
    const response = await fetch('/api/recipes', {
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });
    const data = await response.json();
    if (response.ok) {
        console.log('Recipes:', data);
    } else {
        console.error('Failed to fetch recipes:', data);
    }
    }

    // Contoh penggunaan
    fetchRecipes();
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
    
    #### **Menambah Resep Baru**
    ```javascript
    async function addRecipe(recipe) {
    const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(recipe)
    });
    const data = await response.json();
    if (response.ok) {
        console.log('Recipe added:', data);
    } else {
        console.error('Failed to add recipe:', data);
    }
    }

    // Contoh penggunaan
    addRecipe({ title: 'Recipe B', ingredients: ['Ingredient 3', 'Ingredient 4'] });
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
    
    #### **Mengambil Semua Ulasan**
    ```javascript
    async function fetchReviews() {
    const response = await fetch('/api/reviews', {
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });
    const data = await response.json();
    if (response.ok) {
        console.log('Reviews:', data);
    } else {
        console.error('Failed to fetch reviews:', data);
    }
    }

    // Contoh penggunaan
    fetchReviews();
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
    
    #### **Menambah Ulasan Baru**
    ```javascript
    async function addReview(review) {
    const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(review)
    });
    const data = await response.json();
    if (response.ok) {
        console.log('Review added:', data);
    } else {
        console.error('Failed to add review:', data);
    }
    }

    // Contoh penggunaan
    addReview({ product_id: 1, rating: 4, comment: 'Very good, but could be improved.' });
    ```

---

## **3. Pesan Kesalahan dan Kode Status**
Dokumentasi ini juga mencakup beberapa pesan kesalahan umum dan kode status yang mungkin Anda temui saat menggunakan API:

- **400 Bad Request**: Permintaan tidak valid.
- **401 Unauthorized**: Token tidak valid atau tidak ada.
- **404 Not Found**: Endpoint tidak ditemukan.
- **500 Internal Server Error**: Terjadi kesalahan di server.

---

## **4. API Terintegrasi**
### **A. Integrasi dengan teman sekelas: Chatbot API (Jonathan Wiguna – 18222019)**


### **Dokumentasi API Chatbot AI**

#### **1. Deskripsi Umum**
Chatbot AI ini diintegrasikan melalui API endpoint dari webapp eksternal. Chatbot ini menggunakan model AI Grok untuk memberikan respons interaktif dan kontekstual berdasarkan input pengguna.

#### **2. Endpoint API**
- **URL Endpoint**: `https://spotify-bot.azurewebsites.net/v1/chat`
- **Metode**: `POST`
- **Content-Type**: `application/json`

#### **3. Parameter Request**
| Parameter      | Tipe Data | Deskripsi                                                                 |
|----------------|-----------|---------------------------------------------------------------------------|
| `message`      | String    | Pesan yang dikirim oleh pengguna ke chatbot.                              |
| `session_id`   | String    | ID sesi untuk melacak percakapan (opsional, digunakan untuk konteks).    |
| `language`     | String    | Bahasa yang digunakan (default: `id` untuk Bahasa Indonesia).             |
| `context`      | Object    | Konteks tambahan untuk percakapan (opsional).                             |

Contoh Request Body:
```json
{
  "message": "Apa saja manfaat buah apel?",
  "session_id": "12345",
  "language": "id",
  "context": {
    "user_id": "67890",
    "preferences": {
      "diet": "vegan"
    }
  }
}
```

#### **4. Response API**
| Parameter      | Tipe Data | Deskripsi                                                                 |
|----------------|-----------|---------------------------------------------------------------------------|
| `response`     | String    | Pesan balasan dari chatbot.                                              |
| `session_id`   | String    | ID sesi yang sama dengan request (jika disediakan).                      |
| `status`       | String    | Status respons (`success` atau `error`).                                 |
| `error`        | Object    | Informasi error jika terjadi (opsional).                                 |

Contoh Response Body:
```json
{
  "response": "Buah apel kaya akan serat, vitamin C, dan antioksidan. Cocok untuk diet vegan!",
  "session_id": "12345",
  "status": "success"
}
```

#### **5. Error Handling**
- **400 Bad Request**: Request tidak valid (misalnya, `message` kosong).
- **401 Unauthorized**: API key tidak valid atau tidak disertakan.
- **500 Internal Server Error**: Kesalahan server pada webapp eksternal.

---

### **Panduan Implementasi Chatbot AI**

#### **1. Persiapan**
- Dapatkan API key dari webapp eksternal.
- Pastikan Anda memiliki akses ke endpoint API.

#### **2. Integrasi di Frontend**
Berikut contoh implementasi menggunakan React dan Axios:

```javascript
import axios from 'axios';

const sendMessageToChatbot = async (message, sessionId = null) => {
  try {
    const response = await axios.post(
      'https://api.external-chatbot.com/v1/chat',
      {
        message,
        session_id: sessionId,
        language: 'id',
        context: {
          user_id: '67890', // Ganti dengan ID pengguna yang sesuai
          preferences: {
            diet: 'vegan', // Sesuaikan dengan preferensi pengguna
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer YOUR_API_KEY`, // Ganti dengan API key Anda
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error communicating with chatbot:', error);
    return {
      status: 'error',
      error: error.message,
    };
  }
};

// Contoh penggunaan
const handleUser Message = async () => {
  const userMessage = 'Apa saja manfaat buah apel?';
  const response = await sendMessageToChatbot(userMessage, '12345');
  console.log('Chatbot Response:', response.response);
};
```

#### **3. Integrasi di Backend (Opsional)**
Jika Anda ingin mengelola API call dari backend (misalnya, untuk keamanan atau caching), berikut contoh menggunakan Node.js:

```javascript
const axios = require('axios');

const sendMessageToChatbot = async (message, sessionId = null) => {
  try {
    const response = await axios.post(
      'https://api.external-chatbot.com/v1/chat',
      {
        message,
        session_id: sessionId,
        language: ' id',
        context: {
          user_id: '67890', // Ganti dengan ID pengguna yang sesuai
          preferences: {
            diet: 'vegan', // Sesuaikan dengan preferensi pengguna
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer YOUR_API_KEY`, // Ganti dengan API key Anda
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error communicating with chatbot:', error);
    return {
      status: 'error',
      error: error.message,
    };
  }
};

// Contoh penggunaan
const handleUser Message = async () => {
  const userMessage = 'Apa saja manfaat buah apel?';
  const response = await sendMessageToChatbot(userMessage, '12345');
  console.log('Chatbot Response:', response.response);
};
```

#### **4. Pengujian**
- Lakukan pengujian untuk memastikan integrasi berjalan dengan baik.
- Uji berbagai skenario input untuk melihat bagaimana chatbot merespons.

#### **5. Pemeliharaan**
- Monitor penggunaan API dan respons chatbot.
- Perbarui API key dan endpoint jika ada perubahan dari penyedia layanan.



Dengan dokumentasi dan panduan implementasi ini, Anda dapat mengintegrasikan Chatbot AI ke dalam webapp eksternal dengan lebih mudah. Jika ada bagian lain yang ingin Anda eksplorasi lebih lanjut, silakan beri tahu!



---

### **B. Integrasi dengan AI hugging Face LLM: mistralai/Mistral-Nemo-Instruct-2407**

Berikut adalah dokumentasi lengkap API endpoint dan panduan implementasinya.

### **Dokumentasi API Endpoint Rekomendasi Resep**

#### **1. Deskripsi Umum**
Fitur rekomendasi resep menggunakan model LLM Mistral dari Hugging Face untuk menghasilkan resep makanan berdasarkan bahan-bahan yang ada di keranjang belanja pengguna. API ini mengambil input berupa daftar bahan dan mengembalikan resep yang relevan.

#### **2. Endpoint API**
- **URL Endpoint**: `https://api.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407`
- **Metode**: `POST`
- **Content-Type**: `application/json`

#### **3. Parameter Request**
| Parameter      | Tipe Data | Deskripsi                                                                 |
|----------------|-----------|---------------------------------------------------------------------------|
| `inputs`       | String    | Daftar bahan makanan yang ada di keranjang belanja pengguna.             |
| `parameters`   | Object    | Parameter tambahan untuk model (opsional).                               |

Contoh Request Body:
```json
{
  "inputs": "Bahan: apel, pisang, susu, madu",
  "parameters": {
    "max_length": 200,
    "temperature": 0.7,
    "top_k": 50
  }
}
```

#### **4. Response API**
| Parameter      | Tipe Data | Deskripsi                                                                 |
|----------------|-----------|---------------------------------------------------------------------------|
| `generated_text` | String  | Resep yang dihasilkan oleh model.                                        |
| `status`       | String    | Status respons (`success` atau `error`).                                 |
| `error`        | Object    | Informasi error jika terjadi (opsional).                                 |

Contoh Response Body:
```json
{
  "generated_text": "Resep Smoothie Pisang Apel: 1. Blender pisang dan apel. 2. Tambahkan susu dan madu. 3. Blender hingga halus. Sajikan dingin.",
  "status": "success"
}
```

#### **5. Error Handling**
- **400 Bad Request**: Request tidak valid (misalnya, `inputs` kosong).
- **401 Unauthorized**: API key tidak valid atau tidak disertakan.
- **500 Internal Server Error**: Kesalahan server pada Hugging Face.

---

### **Panduan Implementasi Rekomendasi Resep**

#### **1. Persiapan**
- Dapatkan API key dari Hugging Face.
- Pastikan Anda memiliki akses ke model Mistral-Nemo-Instruct-2407.

#### **2. Integrasi di Frontend**
Berikut contoh implementasi menggunakan React dan Axios:

```javascript
import axios from 'axios';

const getRecipeRecommendation = async (ingredients) => {
  try {
    const response = await axios.post(
      'https://api.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407',
      {
        inputs: `Bahan: ${ingredients.join(', ')}`,
        parameters: {
          max_length: 200,
          temperature: 0.7,
          top_k: 50,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer YOUR_HUGGINGFACE_API_KEY`, // Ganti dengan API key Anda
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error communicating with Hugging Face API:', error);
    return {
      status: 'error',
      error: error.message,
    };
  }
};

// Contoh penggunaan
const handleGetRecipe = async () => {
  const ingredients = ['apel', 'pisang', 'susu', 'madu'];
  const response = await getRecipeRecommendation(ingredients);
  console.log('Recipe Recommendation:', response.generated_text);
};
```

#### **3. Integrasi di Backend (Opsional)**
Jika Anda ingin mengelola API call dari backend (misalnya, untuk keamanan atau caching), berikut contoh menggunakan Node.js:

```javascript
const axios = require('axios');

const getRecipeRecommendation = async (ingredients) => {
  try {
    const response = await axios.post(
      'https://api.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407',
      {
        inputs: `Bahan: ${ingredients.join(', ')}`,
        parameters: {
          max_length: 200,
          temperature: 0.7,
          top_k: 50,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer YOUR_HUGGINGFACE_API_KEY`, // G anti dengan API key Anda
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error communicating with Hugging Face API:', error);
    return {
      status: 'error',
      error: error.message,
    };
  }
};

// Contoh penggunaan
const handleGetRecipe = async () => {
  const ingredients = ['apel', 'pisang', 'susu', 'madu'];
  const response = await getRecipeRecommendation(ingredients);
  console.log('Recipe Recommendation:', response.generated_text);
};
```

#### **4. Pengujian**
- Lakukan pengujian untuk memastikan integrasi berjalan dengan baik.
- Uji berbagai kombinasi bahan untuk melihat bagaimana model merespons.

#### **5. Pemeliharaan**
- Monitor penggunaan API dan respons dari model.
- Perbarui API key dan endpoint jika ada perubahan dari penyedia layanan.


Dengan dokumentasi dan panduan implementasi ini, Anda dapat mengintegrasikan fitur rekomendasi resep menggunakan API Hugging Face LLM Mistral ke dalam webapp Anda dengan lebih mudah. Jika ada bagian lain yang ingin Anda eksplorasi lebih lanjut, silakan beri tahu!

---
### **C. Integrasi dengan AI Geolocation**
Berikut adalah dokumentasi lengkap API endpoint dan panduan implementasinya.


### **Dokumentasi API Geolocation untuk Fitur Address**

#### **1. Deskripsi Umum**
Fitur address menggunakan API geolocation untuk mendapatkan informasi lokasi pengguna berdasarkan koordinat (latitude dan longitude) atau alamat yang dimasukkan. API ini dapat digunakan untuk:
- Mendapatkan alamat lengkap dari koordinat geografis.
- Mendapatkan koordinat geografis dari alamat yang dimasukkan.
- Menyediakan autocomplete untuk input alamat.

#### **2. Endpoint API**
- **URL Endpoint**: `https://api.geolocation.com/v1/geocode`
- **Metode**: `GET` atau `POST`
- **Content-Type**: `application/json`

#### **3. Parameter Request**
| Parameter      | Tipe Data | Deskripsi                                                                 |
|----------------|-----------|---------------------------------------------------------------------------|
| `lat`          | Number    | Latitude (opsional, jika menggunakan koordinat).                         |
| `lng`          | Number    | Longitude (opsional, jika menggunakan koordinat).                        |
| `address`      | String    | Alamat lengkap atau sebagian (opsional, jika menggunakan alamat).        |
| `apiKey`       | String    | API key untuk autentikasi.                                               |

Contoh Request Body (Koordinat ke Alamat):
```json
{
  "lat": -6.2088,
  "lng": 106.8456,
  "apiKey": "YOUR_API_KEY"
}
```

Contoh Request Body (Alamat ke Koordinat):
```json
{
  "address": "Monas, Jakarta",
  "apiKey": "YOUR_API_KEY"
}
```

#### **4. Response API**
| Parameter      | Tipe Data | Deskripsi                                                                 |
|----------------|-----------|---------------------------------------------------------------------------|
| `address`      | String    | Alamat lengkap yang sesuai dengan koordinat atau input alamat.           |
| `lat`          | Number    | Latitude dari lokasi yang ditemukan.                                     |
| `lng`          | Number    | Longitude dari lokasi yang ditemukan.                                    |
| `status`       | String    | Status respons (`success` atau `error`).                                 |
| `error`        | Object    | Informasi error jika terjadi (opsional).                                 |

Contoh Response Body (Koordinat ke Alamat):
```json
{
  "address": "Monas, Gambir, Jakarta Pusat, DKI Jakarta, Indonesia",
  "lat": -6.2088,
  "lng": 106.8456,
  "status": "success"
}
```

Contoh Response Body (Alamat ke Koordinat):
```json
{
  "address": "Monas, Gambir, Jakarta Pusat, DKI Jakarta, Indonesia",
  "lat": -6.2088,
  "lng": 106.8456,
  "status": "success"
}
```

#### **5. Error Handling**
- **400 Bad Request**: Request tidak valid (misalnya, `lat` dan `lng` tidak disertakan).
- **401 Unauthorized**: API key tidak valid atau tidak disertakan.
- **404 Not Found**: Alamat atau koordinat tidak ditemukan.
- **500 Internal Server Error**: Kesalahan server pada API geolocation.

---

### **Panduan Implementasi Fitur Address**

#### **1. Persiapan**
- Dapatkan API key dari penyedia layanan geolocation (misalnya, Google Maps API, OpenCage, atau lainnya).
- Pastikan Anda memiliki akses ke endpoint API.

#### **2. Integrasi di Frontend**
Berikut contoh implementasi menggunakan React dan Axios:

```javascript
import axios from 'axios';

// Fungsi untuk mendapatkan alamat dari koordinat
const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const response = await axios.get('https://api.geolocation.com/v1/geocode', {
      params: {
        lat,
        lng,
        apiKey: 'YOUR_API_KEY', // Ganti dengan API key Anda
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching address:', error);
    return {
      status: 'error',
      error: error.message,
    };
  }
};

// Fungsi untuk mendapatkan koordinat dari alamat
const getCoordinatesFromAddress = async (address) => {
  try {
    const response = await axios.get('https://api.geolocation.com/v1/geocode', {
      params : {
          address,
          apiKey: 'YOUR_API_KEY', // Ganti dengan API key Anda
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return {
        status: 'error',
        error: error.message,
      };
    }
  };

// Contoh penggunaan
const handleGetAddress = async () => {
  const lat = -6.2088;
  const lng = 106.8456;
  const response = await getAddressFromCoordinates(lat, lng);
  console.log('Address:', response.address);
};

const handleGetCoordinates = async () => {
  const address = 'Monas, Jakarta';
  const response = await getCoordinatesFromAddress(address);
  console.log('Coordinates:', response.lat, response.lng);
};
```

#### **3. Integrasi di Backend (Opsional)**
Jika Anda ingin mengelola API call dari backend, berikut contoh menggunakan Node.js:

```javascript
const axios = require('axios');

// Fungsi untuk mendapatkan alamat dari koordinat
const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const response = await axios.get('https://api.geolocation.com/v1/geocode', {
      params: {
        lat,
        lng,
        apiKey: 'YOUR_API_KEY', // Ganti dengan API key Anda
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching address:', error);
    return {
      status: 'error',
      error: error.message,
    };
  }
};

// Fungsi untuk mendapatkan koordinat dari alamat
const getCoordinatesFromAddress = async (address) => {
  try {
    const response = await axios.get('https://api.geolocation.com/v1/geocode', {
      params: {
        address,
        apiKey: 'YOUR_API_KEY', // Ganti dengan API key Anda
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return {
      status: 'error',
      error: error.message,
    };
  }
};

// Contoh penggunaan
const handleGetAddress = async () => {
  const lat = -6.2088;
  const lng = 106.8456;
  const response = await getAddressFromCoordinates(lat, lng);
  console.log('Address:', response.address);
};

const handleGetCoordinates = async () => {
  const address = 'Monas, Jakarta';
  const response = await getCoordinatesFromAddress(address);
  console.log('Coordinates:', response.lat, response.lng);
};
```

#### **4. Pengujian**
- Lakukan pengujian untuk memastikan integrasi berjalan dengan baik.
- Uji berbagai alamat dan koordinat untuk melihat bagaimana API merespons.

#### **5. Pemeliharaan**
- Monitor penggunaan API dan respons dari layanan geolocation.
- Perbarui API key dan endpoint jika ada perubahan dari penyedia layanan.

Dengan dokumentasi dan panduan implementasi ini, Anda dapat mengintegrasikan fitur address menggunakan API geolocation ke dalam aplikasi Anda dengan lebih mudah. Jika ada bagian lain yang ingin Anda eksplorasi lebih lanjut, silakan beri tahu!


---
## **5. Panduan Instalasi**
Ikuti langkah-langkah berikut untuk menginstal dan menjalankan proyek ini di lingkungan lokal Anda:

1. **Klon repositori**

   ```bash
   git clone https://github.com/steven-adrnn/smart-health-tst.git
   cd smart-health-tst

2. **Instal dependensi**
    ```bash
    npm install

3. **Buat file .env.local**
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=url_supabase_anda
    NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_supabase_anda
    SUPABASE_SERVICE_ROLE_KEY=service_role_key_supabase_anda
    GOOGLE_CLIENT_ID=client_id_auth0_anda
    GOOGLE_CLIENT_SECRET=client_secret_auth0_anda
    NEXT_PUBLIC_HUGGING_FACE_API_KEY=hugging_face_token_anda
    NEXT_PUBLIC_HUGGING_FACE_MODEL_NAME=mistralai/Mistral-7B-Instruct-v0.2
    MUSICMATE_API_KEY=mk_tjZrWLCT04UdNkJYhtcoe7stV0kClKqNB6dLSnzQcRg
    CHATBOT_BASE_URL=https://spotify-bot.azurewebsites.net
    RECIPE_API_KEY=generate_random
    FORUM_API_KEY=generate_random

4. **Jalankan aplikasi**
    ```bash
    npm run dev
---


## **6. Kesimpulan**
Dokumentasi API ini memberikan gambaran menyeluruh tentang cara menggunakan endpoint API dalam proyek Anda. Pastikan untuk mengikuti petunjuk otentikasi dan format permintaan/respons yang telah dijelaskan. Jika ada pertanyaan lebih lanjut atau jika Anda memerlukan penjelasan tambahan, silakan beri tahu saya:
#### WhatsApp: +62 89634198434
#### Email: stevenadrian37@gmail.com


