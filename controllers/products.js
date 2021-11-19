/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response
 */
 const Product = require("../models/product");
 const responseUtils = require('../utils/responseUtils');

/**Get all product */
const getAllProducts = async response => {
  // TODO: 10.2 Implement this
  //return responseUtils.sendJson(response, AllProducts);
  const products = await Product.find({});
  return responseUtils.sendJson(response, products);  
};

/** Delete Product */
 const deleteProduct = async(response, productId) => {
  const currentProduct = await Product.findById(productId).exec();
  // check if product id exists
  if (currentProduct === undefined || currentProduct === null){
    return responseUtils.notFound(response);
  }
  await Product.deleteOne({ _id: currentProduct.id });
  return responseUtils.sendJson(response, currentProduct);
};

/** Update product */
const updateProduct = async(response, productId, productData) => {
  const currentProduct = await Product.findById(productId).exec();
  // check if product id exists
  if (currentProduct === undefined || currentProduct === null){
    return responseUtils.notFound(response);
  }
  // check if name of product is empty
  if (!productData.name) return responseUtils.badRequest(response, "Uncaught Error: Unknown name");
  if (typeof productData.price !== 'number') return responseUtils.badRequest(response, "Uncaught Error: Price is not number");
  if (productData.price === 0) return responseUtils.badRequest(response, "Uncaught Error: zero price");
  if (productData.price < 0) return responseUtils.badRequest(response, "Uncaught Error: price is negative");
  
  // Update product
  currentProduct.name = productData.name;
  currentProduct.price = productData.price;
  if (productData.image) currentProduct.image = productData.image;
  if (productData.description) currentProduct.description = productData.description;
  await currentProduct.save();
  return responseUtils.sendJson(response, currentProduct);
};

/* View product*/
const viewProduct = async(response, productId) => {
  
  const currentProduct = await Product.findById(productId).exec();
  // check if product id exists
  if (currentProduct === undefined || currentProduct === null){
    return responseUtils.notFound(response);
  }
  return responseUtils.sendJson(response, currentProduct);
};

/** Create new product */
const createProduct = async(response, productData) => {
  // check erros
  const product = productData;
  const errors = [];
  if (!productData.name) errors.push('Missing name');
  if (!productData.price) errors.push('Missing price');

  // if exist errors, then return badRequest
  if (errors.length > 0) return responseUtils.badRequest(response, errors);
  
  // creating and saving a new user  
  const newProductData = 
  {
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description
  };
  
  const newProduct = new Product(newProductData);
  await newProduct.save();
  return responseUtils.createdResource(response, newProduct);
};

module.exports = { getAllProducts,deleteProduct, updateProduct, createProduct, viewProduct};