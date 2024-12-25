export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  farm: string;
  rating: number;
  reviews: Review[];
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export const products: Product[] = [
  // Fruits
  {
    id: 1,
    name: "Apel Malang Segar",
    price: 25000,
    image: "/images/apple-malang.jpg",
    category: "fruits",
    description: "Apel segar langsung dari perkebunan Malang",
    farm: "Perkebunan Apel Batu, Malang",
    rating: 4.5,
    reviews: []
  },
  {
    id: 2,
    name: "Pisang Cavendish Organik",
    price: 18000,
    image: "/images/banana-cavendish.jpg",
    category: "fruits",
    description: "Pisang organik kaya nutrisi",
    farm: "Kebun Pisang Lumajang",
    rating: 4.3,
    reviews: []
  },
  // Add 18 more fruit products here...

  // Vegetables
  {
    id: 21,
    name: "Wortel Organik",
    price: 15000,
    image: "/images/carrot-organic.jpg",
    category: "vegetables",
    description: "Wortel segar tanpa pestisida",
    farm: "Kebun Sayur Lembang",
    rating: 4.4,
    reviews: []
  },
  {
    id: 22,
    name: "Brokoli Hijau",
    price: 20000,
    image: "/images/broccoli-green.jpg",
    category: "vegetables",
    description: "Brokoli segar kaya serat",
    farm: "Perkebunan Sayur Dieng",
    rating: 4.6,
    reviews: []
  },
  // Add 18 more vegetable products here...

  // Meat
  {
    id: 41,
    name: "Daging Sapi Wagyu",
    price: 350000,
    image: "/images/beef-wagyu.jpg",
    category: "meat",
    description: "Daging sapi wagyu premium",
    farm: "Peternakan Sapi Wonosobo",
    rating: 4.9,
    reviews: []
  },
  {
    id: 42,
    name: "Ayam Kampung Organik",
    price: 75000,
    image: "/images/chicken-organic.jpg",
    category: "meat",
    description: "Ayam kampung bebas hormon",
    farm: "Peternakan Ayam Cianjur",
    rating: 4.7,
    reviews: []
  },
  // Add 18 more meat products here...

  // Dairy
  {
    id: 61,
    name: "Susu Sapi Segar",
    price: 25000,
    image: "/images/milk-fresh.jpg",
    category: "dairy",
    description: "Susu sapi segar pasteurisasi",
    farm: "Peternakan Sapi Perah Bandung",
    rating: 4.8,
    reviews: []
  },
  {
    id: 62,
    name: "Keju Cheddar Lokal",
    price: 45000,
    image: "/images/cheese-cheddar.jpg",
    category: "dairy",
    description: "Keju cheddar buatan lokal",
    farm: "Pabrik Keju Salatiga",
    rating: 4.5,
    reviews: []
  },
  // Add 18 more dairy products here...
];

export const getProductsByCategory = (category: string) => {
  return products.filter(product => product.category === category);
};

export const getAllProducts = () => {
  return products;
};

export const getProductById = (id: number) => {
  return products.find(product => product.id === id);
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
};

