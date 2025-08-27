import express from 'express';
import Product from '../models/product.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// GET all products OR filter by category
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    let filter = {};
    if (category) {
      filter.category = category; // make sure your Product schema has a "category" field
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Error fetching product", error: err.message });
  }
});

// GET products by category name
router.get("/category/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;

    const products = await Product.find({ category: categoryName });

    if (!products.length) {
      return res.status(404).json({ message: "No products found in this category" });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
});

//  POST create new product
router.post('/', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error adding product', error: err.message });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
});

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

//  DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
});

export default router;
