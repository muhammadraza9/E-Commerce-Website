const prisma = require("../src/config/db");

const products = [
  { name: "Classic White T-Shirt", description: "Premium cotton crew neck t-shirt, soft and breathable.", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop", category: "T-Shirts", price: 1499 },
  { name: "Black Graphic Tee", description: "Bold graphic print on 100% combed cotton fabric.", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop", category: "T-Shirts", price: 1699 },
  { name: "Striped Polo Shirt", description: "Classic striped polo with ribbed collar and cuffs.", image: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=600&h=750&fit=crop", category: "T-Shirts", price: 2199 },
  { name: "Denim Jacket", description: "Vintage wash denim jacket with button closure.", image: "https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=600&h=750&fit=crop", category: "Clothing", price: 4999 },
  { name: "Slim Fit Jeans", description: "Stretch denim slim fit jeans, dark indigo wash.", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=750&fit=crop", category: "Clothing", price: 3499 },
  { name: "Cargo Pants", description: "Utility cargo pants with multiple pockets, relaxed fit.", image: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&h=750&fit=crop", category: "Clothing", price: 3299 },
  { name: "Pullover Hoodie", description: "Heavyweight fleece hoodie with kangaroo pocket.", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop", category: "Hoodies", price: 3799 },
  { name: "Zip-Up Hoodie", description: "Full zip hoodie with drawstring hood, soft fleece lining.", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=750&fit=crop", category: "Hoodies", price: 3999 },
  { name: "Oversized Hoodie", description: "Streetwear oversized fit hoodie, dropped shoulders.", image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=600&h=750&fit=crop", category: "Hoodies", price: 4299 },
  { name: "Running Sneakers", description: "Lightweight breathable mesh running shoes with cushioned sole.", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=750&fit=crop", category: "Shoes", price: 5999 },
  { name: "Classic White Sneakers", description: "Minimalist leather sneakers, versatile everyday wear.", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=750&fit=crop", category: "Shoes", price: 6499 },
  { name: "High-Top Canvas Shoes", description: "Classic canvas high-tops with rubber sole.", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=750&fit=crop", category: "Shoes", price: 4499 },
  { name: "Leather Chelsea Boots", description: "Premium leather Chelsea boots with elastic side panels.", image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&h=750&fit=crop", category: "Shoes", price: 7999 },
  { name: "Leather Wallet", description: "Genuine leather bifold wallet with card slots.", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=750&fit=crop", category: "Accessories", price: 1899 },
  { name: "Aviator Sunglasses", description: "UV protected aviator sunglasses with metal frame.", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=750&fit=crop", category: "Accessories", price: 2299 },
  { name: "Leather Belt", description: "Classic leather belt with brushed metal buckle.", image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&h=750&fit=crop", category: "Accessories", price: 1599 },
  { name: "Canvas Backpack", description: "Durable canvas backpack with laptop compartment.", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=750&fit=crop", category: "Accessories", price: 3299 },
  { name: "Wool Beanie", description: "Soft knit wool beanie, one size fits all.", image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&h=750&fit=crop", category: "Accessories", price: 999 },
  { name: "Plaid Flannel Shirt", description: "Brushed flannel shirt in classic plaid pattern.", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=750&fit=crop", category: "Clothing", price: 2799 },
  { name: "Linen Summer Shirt", description: "Lightweight linen shirt, perfect for warm weather.", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop", category: "Clothing", price: 2599 },
  { name: "Bomber Jacket", description: "Classic bomber jacket with ribbed cuffs and collar.", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=750&fit=crop", category: "Clothing", price: 5499 },
  { name: "Athletic Joggers", description: "Tapered fit joggers with elastic waistband, moisture-wicking.", image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=750&fit=crop", category: "Clothing", price: 2299 },
  { name: "V-Neck T-Shirt", description: "Soft cotton blend v-neck tee, fitted silhouette.", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=750&fit=crop", category: "T-Shirts", price: 1399 },
  { name: "Long Sleeve Henley", description: "Button placket henley shirt in heavyweight cotton.", image: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&h=750&fit=crop", category: "T-Shirts", price: 1899 },
  { name: "Tie-Dye T-Shirt", description: "Vibrant tie-dye print tee, relaxed unisex fit.", image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=750&fit=crop", category: "T-Shirts", price: 1799 },
  { name: "Fleece Sweatpants", description: "Cozy fleece sweatpants with side pockets and drawstring.", image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=750&fit=crop", category: "Hoodies", price: 2799 },
  { name: "Half-Zip Sweater", description: "Knit half-zip pullover sweater, mock neck design.", image: "https://images.unsplash.com/photo-1614975059251-992f11792b9f?w=600&h=750&fit=crop", category: "Hoodies", price: 3599 },
  { name: "Slide Sandals", description: "Comfortable foam slide sandals, water resistant.", image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&h=750&fit=crop", category: "Shoes", price: 1999 },
  { name: "Suede Loafers", description: "Handcrafted suede loafers with cushioned insole.", image: "https://images.unsplash.com/photo-1582897085656-c636d006a246?w=600&h=750&fit=crop", category: "Shoes", price: 5499 },
  { name: "Crossbody Sling Bag", description: "Compact crossbody bag with adjustable strap, multiple pockets.", image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&h=750&fit=crop", category: "Accessories", price: 2199 },
];

async function main() {
  console.log("Deleting old products...");
  await prisma.product.deleteMany({});

  console.log("Seeding new products...");
  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`Successfully added ${products.length} products!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });