const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// OrderedItemSchema
const OrderedItemSchema = new Schema({
    // for 'product '
    product: {
        // for '_id'
        _id: {
          type: String,
          required: true
        },
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
        // for 'description'
        description: {
            type: String
        }
    },
    quantity :{
        Min: 1,
        type: Number,
        required: true
    }   
});
OrderedItemSchema.set('toJSON', { virtuals: false, versionKey: false });
const OrderedItem = new mongoose.model('OrderedItem', OrderedItemSchema);

// orderSchema
const orderSchema = new Schema({
  // for 'customerId ' 
  customerId : {
    type: String,
    format: mongoose.mongo.ObjectID,
    required: true
  },
  // for 'items'
  items: {
    type: Array,
    required: true,
    minLength: 1,
    items: Array[OrderedItem]
  }
});


// Omit the version key when serialized to JSON
orderSchema.set('toJSON', { virtuals: false, versionKey: false });

const Order = new mongoose.model('Order', orderSchema);
module.exports = Order;