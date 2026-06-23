const prisma = require("../config/db");

// Get All Products

const getProducts = async (req, res) => {
try {
const products =
await prisma.product.findMany();


res.status(200).json(products);


} catch (err) {
console.log(err);


res.status(500).json({
  message: "Server Error",
});


}
};

// Get Single Product

const getProduct = async (
req,
res
) => {
try {
const product =
await prisma.product.findUnique({
where: {
id: Number(req.params.id),
},
});


if (!product) {
  return res.status(404).json({
    message:
      "Product not found",
  });
}

res.json(product);


} catch (err) {
res.status(500).json({
error: err.message,
});
}
};

// Add Product

const createProduct = async (
req,
res
) => {
try {
const {
name,
description,
image,
price,
} = req.body;


const product =
  await prisma.product.create({
    data: {
      name,
      description,
      image,
      price: Number(price),
    },
  });

res.status(201).json(product);


} catch (err) {
console.log(
"CREATE PRODUCT ERROR:"
);


console.log(err);

res.status(500).json({
  error: err.message,
});

}
};


// Update Product

const updateProduct = async (
req,
res
) => {
try {
const {
name,
description,
image,
price,
} = req.body;


const product =
  await prisma.product.update({
    where: {
      id: Number(req.params.id),
    },

    data: {
      name,
      description,
      image,
      price: Number(price),
    },
  });

res.json(product);


} catch (err) {
res.status(500).json({
error: err.message,
});
}
};

// Delete Product

const deleteProduct = async (
req,
res
) => {
try {
await prisma.product.delete({
where: {
id: Number(req.params.id),
},
});


res.json({
  success: true,
  message:
    "Product deleted",
});

} catch (err) {
res.status(500).json({
error: err.message,
});
}
};

module.exports = {
getProducts,
getProduct,
createProduct,
updateProduct,
deleteProduct,
};
