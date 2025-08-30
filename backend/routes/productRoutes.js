const express = require('express');
const multer = require('multer');
const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductImage,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const router = express.Router();

// Multer memory storage (no file saved to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post('/', upload.single('image'), createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/:id/image', getProductImage);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
