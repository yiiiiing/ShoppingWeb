const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// productSchema
const productSchema = new Schema({
  // for 'name' 
  name: {
    type: String,
    required: true
  },
  // for 'price'
  price: {
    type: Number,
    required: true,
    min: 0
  },
  // for 'image'
  image: {
    type: String,
    format: URL
  },
  // for 'description'
  description: {
    type: String
  }
});


// Omit the version key when serialized to JSON
productSchema.set('toJSON', { virtuals: false, versionKey: false });

const Product = new mongoose.model('Product', productSchema);
module.exports = Product;