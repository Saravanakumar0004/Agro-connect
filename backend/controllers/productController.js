const Product = require('../models/Product');
const User = require('../models/User');

// Create Product with image stored in MongoDB
async function createProduct(req, res) {
  try {
    const { farmerId, name, price, quantity, description } = req.body;

    if (!farmerId || !name || !price || !quantity || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const farmer = await User.findById(farmerId);
    if (!farmer || farmer.role !== 'farmer') {
      return res.status(400).json({ message: 'Invalid farmerId or user is not a farmer' });
    }

    let imageData = null;
    if (req.file) {
      imageData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const product = new Product({
      name,
      price,
      quantity,
      description, // ✅ Store description
      farmerId,
      image: imageData,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('❌ Error creating product:', err);
    res.status(500).json({ message: err.message });
  }
}

// Get all products without image binary (only metadata)
async function getAllProducts(req, res) {
  try {
    const products = await Product.find().populate('farmerId', 'name location');
    res.json(products.map(p => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      quantity: p.quantity,
      description: p.description, // ✅ Include description
      farmerId: p.farmerId,
    })));
  } catch (err) {
    console.error('❌ Error fetching products:', err);
    res.status(500).json({ message: err.message });
  }
}

// Get single product by ID (without image)
async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id).populate(
      'farmerId',
      'name  location phone'
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    const { image, ...productData } = product.toObject();
    res.json(productData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}


// Serve product image by product ID
async function getProductImage(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.image || !product.image.data) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.set('Content-Type', product.image.contentType);
    res.send(product.image.data);
  } catch (err) {
    console.error('❌ Error fetching image:', err);
    res.status(500).json({ message: err.message });
  }
}

// Update product (with optional image replacement)
async function updateProduct(req, res) {
  try {
    const updates = req.body;

    if (req.file) {
      updates.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (err) {
    console.error('❌ Error updating product:', err);
    res.status(500).json({ message: err.message });
  }
}

// Delete product by ID
async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting product:', err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductImage,
  updateProduct,
  deleteProduct,
};
