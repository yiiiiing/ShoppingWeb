const addToCart = (productId, productName) => {
  // TODO 9.2
  // use addProductToCart(), available already from /public/js/utils.js
  // /public/js/utils.js also includes createNotification() function  
  addProductToCart(productId);
  createNotification(`Added ${productName} to cart!`, 'notifications-container', true);
};

(async() => {
  //TODO 9.2 
  // - get the 'products-container' element
  // - get the 'product-template' element
  // - use getJSON(url) to get the available products
  // - for each of the products:
  //    * clone the template
  //    * add product information to the template clone
  //    * remember to add an event listener for the button's 'click' event, and call addToCart() in the event listener's callback
  // - remember to add the products to the the page
  const baseContainer = document.querySelector('#products-container');
  const productTemplate = document.querySelector('#product-template');
 
  try {
    const products = await getJSON('/api/products');

    // if no any product
    if (products.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'No products';
      baseContainer.append(p);
      return;
    }

    products.forEach(product => {
      const { _id: id, name, description, price } = product;
      const productContainer = productTemplate.content.cloneNode(true);
      // display product name, description and price
      productContainer.querySelector('.item-row').id = id;
      productContainer.querySelectorAll('[class]').forEach(elem => {
        const prop = elem.className.split('-')[1];
        if (!product[prop]) return;

        elem.id = `${prop}-${id}`;
        elem.textContent = product[prop];
      });
      // Add click event to button
      const button = productContainer.querySelector('button');
      button.id = `add-to-cart-${id}`;
      button.addEventListener('click', () => addToCart(id, name));
      baseContainer.append(productContainer);
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