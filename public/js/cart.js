const baseContainer = document.querySelector('#cart-container');
const cartItemTemplate = document.querySelector('#cart-item-template');
const placeButton = document.querySelector('#place-order-button');

//const { getAllProducts, deleteProduct, updateProduct, createProduct, viewProduct} = require("../../controllers/products");

const addToCart = productId => {
  // TODO 9.2
  // use addProductToCart(), available already from /public/js/utils.js
  // call updateProductAmount(productId) from this file
  addProductToCart(productId);
  updateProductAmount(productId);
};

const decreaseCount = productId => {
  // TODO 9.2
  // Decrease the amount of products in the cart, /public/js/utils.js provides decreaseProductCount()
  // Remove product from cart if amount is 0,  /public/js/utils.js provides removeElement = (containerId, elementId
  const count = decreaseProductCount(productId);
  if (count === 0) {
    //removeElement("cart-container", productId);
    document.getElementById(`${productId}`).remove();
  }
  else updateProductAmount(productId); 
};

const updateProductAmount = productId => {
  // TODO 9.2
  // - read the amount of products in the cart, /public/js/utils.js provides getProductCountFromCart(productId)
  const count = getProductCountFromCart(productId);
  // - change the amount of products shown in the right element's innerText
  document.getElementById(`${productId}`).querySelector(".product-amount").textContent = count + "x";
};

const placeOrder = async() => {
  // TODO 9.2
  // Get all products from the cart, /public/js/utils.js provides getAllProductsFromCart()
  const allProducts = getAllProductsFromCart(); 
  // for each of the products in the cart remove them, /public/js/utils.js provides removeElement(containerId, elementId)
  allProducts.forEach(product => {
    document.getElementById(`#${product.name}`).forEach(element => element.remove());
    //removeElement("cart-container", product.name);
  });
  // also clear cart
  clearCart();
  // show the user a notification: /public/js/utils.js provides createNotification = (message, containerId, isSuccess = true)
  createNotification("Successfully created an order!", "notifications-container", true);
};

// get products by productID
const getProductById = (allProducts, productId) => {
  const currentProduct = allProducts.find((product) => {return product._id === productId;});
  return currentProduct;
};

(async() => {
  // TODO 9.2
  // - get the 'cart-container' element
  // - use getJSON(url) to get the available products
  // - get all products from cart
  // - get the 'cart-item-template' template
  // - for each item in the cart
  //    * copy the item information to the template
  //    * remember to add event listeners for cart-minus-plus-button cart-minus-plus-button elements. querySelectorAll() can be used to select all elements with each of those classes, then its just up to finding the right index
  // - in the end remember to append the modified cart item to the cart 


  try {
    const allProducts = await getJSON('/api/products');
    const cartItems = await getAllProductsFromCart();
    cartItems.forEach(item => {
      var amount = item.amount;
      var id = item.name;
      const product = getProductById(allProducts, id); 
      item.name = product.name;
      item.price = product.price;   
      item.amount = amount + "x";          
      const itemContainer = cartItemTemplate.content.cloneNode(true);
      itemContainer.querySelector('.item-row').id = id;
      itemContainer.querySelectorAll('[class]').forEach(elem => {
        if (elem.classList.contains('cart-minus-plus-button')) {
          if (elem.textContent.includes("+")){
            elem.id = `plus-${id}`;
            return elem.addEventListener('click', () => {addToCart(id);});
          }
          else {
            elem.id = `minus-${id}`;
            return elem.addEventListener('click', () => {decreaseCount(id);});
          }
        }
        const prop = elem.className.split('-')[1];
        if (!item[prop]) return;
        elem.id = `${prop}-${id}`;
        elem.textContent = item[prop];
      });
      placeButton.addEventListener('click', async () => {
        await placeOrder();});
      baseContainer.append(itemContainer);
    });
  } catch (error) {
    console.error(error);
    return createNotification(
      'There was an error while fetching products',
      'notifications-container',
      false
    );
  }

})();