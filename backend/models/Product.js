const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description:{ type: String, required: true},
  quantity: { type: Number, default: 1 },
  image: {
    data: Buffer,        // Store binary image data
    contentType: String  // MIME type of image
  },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Product', productSchema);
