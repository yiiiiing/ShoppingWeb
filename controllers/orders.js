/**
 * Send all Orders as JSON
 *
 * @param {http.ServerResponse} response
 */
 const Order = require("../models/order");
 const responseUtils = require('../utils/responseUtils');

/**Get all product */
const getAllOrders = async response => {
  const orders = await Order.find({});
  return responseUtils.sendJson(response, orders);  
};

/**Customer get orders */
const getAllOrdersByCustomer = async (response, userId) => {
    let userOrders = await Order.find({customerId: userId}).exec();
    return responseUtils.sendJson(response, userOrders);  
};

/* View Order*/
const viewOrder = async(response, orderId, user) => {
  
  const currentOrder = await Order.findById(orderId).exec();
  // check if order id exists
  if (currentOrder === undefined || currentOrder === null){
    return responseUtils.notFound(response);
  }
  if(user.role === 'admin') return responseUtils.sendJson(response, currentOrder);
  // else (if role is customer) check if order's owner equals to the current customer
  // type of user._id  is object
  if (currentOrder.customerId !== user._id.toString()) {
    console.log("not equal");
    return responseUtils.notFound(response);
  }
  return responseUtils.sendJson(response, currentOrder);
};

/** Create Order */
const createOrder = async(response, orderData, userId) => {
    // check erros
    const orderItems = orderData.items;
    var Errors = [];
    if (orderItems.length === 0) Errors.push("Missing items");
    orderItems.forEach(item => {
        if (!item.quantity) Errors.push("Missing quantity");
        const itemProduct = item.product;
        if (!itemProduct) Errors.push("Missing product");   
        if(itemProduct) {
            if (!itemProduct._id) Errors.push("Missing product id");
            if (!itemProduct.name) Errors.push("Missing product name");
            if (!itemProduct.price) Errors.push("Missing price");    
        }      
    });
    if(Errors.length > 0) return responseUtils.badRequest(response, Errors);
    // creating and saving a new user  
    const newOrderData = 
    {
        customerId: userId,
        items: orderItems,
    };
    const newOrder = new Order(newOrderData);
    await newOrder.save();
    return responseUtils.createdResource(response, newOrder);
};

module.exports = {getAllOrders,viewOrder, createOrder, getAllOrdersByCustomer};