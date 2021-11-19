const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson, getCredentials} = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const {getCurrentUser} = require('./auth/auth');
const User = require("./models/user");
// functions from controller
const {getAllUsers, registerUser, deleteUser, viewUser, updateUser} = require("./controllers/users");
const { getAllProducts,deleteProduct, updateProduct, createProduct, viewProduct} = require("./controllers/products");
const {getAllOrders,viewOrder, createOrder, getAllOrdersByCustomer} = require('./controllers/orders');
/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  '/api/register': ['POST'],
  '/api/users': ['GET'],
  '/api/products': ['GET', 'POST'],
  '/api/orders': ['GET', 'POST']
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response
 */
const sendOptions = (filePath, response) => {
  if (filePath in allowedMethods) {
    response.writeHead(204, {
      'Access-Control-Allow-Methods': allowedMethods[filePath].join(','),
      'Access-Control-Allow-Headers': 'Content-Type,Accept',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Expose-Headers': 'Content-Type,Accept'
    });
    return response.end();
  }

  return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix
 * @returns {boolean}
 */
const matchIdRoute = (url, prefix) => {
  const idPattern = '[0-9a-z]{8,24}';
  const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
  return regex.test(url);
};

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url filePath
 * @returns {boolean}
 */
const matchUserId = url => {
  return matchIdRoute(url, 'users');
};

/**
 * Does the URL match /api/products/{id}
 *
 * @param {string} url filePath
 * @returns {boolean}
 */
 const matchProductId = url => {
  return matchIdRoute(url, 'products');
};

/** Does the URL match /api/orders/{id}*/
const matchOrderId = url => {
  return matchIdRoute(url, 'orders');
}

const handleRequest = async(request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  // serve static files from public/ and return immediately
  if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
    const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
    return renderPublic(fileName, response);
  }

  // See: http://restcookbook.com/HTTP%20Methods/options/
  if (method.toUpperCase() === 'OPTIONS') return sendOptions(filePath, response);

  // Default to 404 Not Found if unknown url
  // and also not mach userID url and productID url
  if (!(filePath in allowedMethods || matchUserId(filePath) || matchProductId(filePath) || matchOrderId(filePath))) {
    console.warn("url not found");
    return responseUtils.notFound(response);
  }

  // Check for allowable methods
  if (allowedMethods[filePath]){
    if (!allowedMethods[filePath].includes(method.toUpperCase())) {
      console.warn("method is not accepted");
      return responseUtils.methodNotAllowed(response);
    }
  }

  // Require a correct accept header (require 'application/json' or '*/*')
  if (!acceptsJson(request)) {
    console.warn("header is not accepted");
    if (method.toUpperCase() === 'PUT' && (!request.headers.authorization)){
      return responseUtils.basicAuthChallenge(response);
    }
    return responseUtils.contentTypeNotAcceptable(response);
  }

  // View/ Update and delete a single user by ID (GET, PUT, DELETE)
  if (matchUserId(filePath)) {
      // check user's authorization
      const requestUser = await getCurrentUser(request);
      if (!requestUser) return responseUtils.basicAuthChallenge(response);  
      // checking Authorization credentials
      const compare = getCredentials(request);
      const checkingPassword = await requestUser.checkPassword(compare[1]);
      if (!checkingPassword) return responseUtils.basicAuthChallenge(response);  
      // check user's role 
      if (requestUser.role !== "admin" ) return responseUtils.forbidden(response);
      // the user(needed to be operated) and id
      const idInfo = filePath.split("/")[3];
      const tobeOperatedUser = await User.findById(idInfo).exec(); 
      // check if user exists 
      if (!tobeOperatedUser) return responseUtils.notFound(response);      
      // view user
      const requestUserID = requestUser._id;
      if (method.toUpperCase() === 'GET') return await viewUser(response, requestUserID, tobeOperatedUser);   
      // update user's role (cannot update own data)
      if (method.toUpperCase() === 'PUT') {
        const userData = await parseBodyJson(request);
        return await updateUser(response, tobeOperatedUser.id, requestUser, userData);
      }
      // delete user
      if (method.toUpperCase() === 'DELETE'){       
          return await deleteUser(response, idInfo, requestUser);                 
      }  
  }

  // View/update/delete single product
  if (matchProductId(filePath)){
      const currentUser = await getCurrentUser(request);
      // if currentUser is undefined or null
      if (!currentUser) return responseUtils.basicAuthChallenge(response);  
      // checking Authorization credentials
      const compare = getCredentials(request);
      const checkingPassword = await currentUser.checkPassword(compare[1]);
      if (!checkingPassword) return responseUtils.basicAuthChallenge(response);
      // no above issues
      // the product id
      const productID = filePath.split("/")[3];    
      if (method.toUpperCase() === 'GET') return await viewProduct(response, productID);  
      
      // When update and delete product, user must be admin 
      if (currentUser.role !== "admin") return responseUtils.forbidden(response);
      // update product
      if (method.toUpperCase() === 'PUT') {
        const productData = await parseBodyJson(request);
        return await updateProduct(response, productID, productData);
      }
      // delete product
      if (method.toUpperCase() === 'DELETE'){       
          return await deleteProduct(response, productID);                 
      }  
  }
 
  // GET all users
  if (filePath === '/api/users' && method.toUpperCase() === 'GET') {
    const currentUser = await getCurrentUser(request);
    // if currentUser is undefined or null
    if (!currentUser) return responseUtils.basicAuthChallenge(response);  
    // checking Authorization credentials
    const compare = getCredentials(request);
    const checkingPassword = await currentUser.checkPassword(compare[1]);
    if (!checkingPassword) return responseUtils.basicAuthChallenge(response);
    if (currentUser.role !== "admin") return responseUtils.forbidden(response);
    // No above issues
    return await getAllUsers(response);
  }

  // register new user
  if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
    // Fail if not a JSON request, don't allow non-JSON Content-Type
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    // TODO: 8.4 Implement registration
    // You can use parseBodyJson(request) method from utils/requestUtils.js to parse request body.
    // 
    const user = await parseBodyJson(request);
    return await registerUser(response, user);       
  }

  // Get all products
  if (filePath === '/api/products' && method.toUpperCase() === 'GET'){
    const currentUser = await getCurrentUser(request);
    // if currentUser is undefined or null
    if (!currentUser) return responseUtils.basicAuthChallenge(response);  
    // if currentUser exist, check password
    const compare = getCredentials(request);
    const checkingPassword = await currentUser.checkPassword(compare[1]);
    // password is wrong
    if (!checkingPassword) return responseUtils.basicAuthChallenge(response);   
    // no above issues
    return await getAllProducts(response);    
  }

  // Create a new product
  if (filePath === '/api/products' && method.toUpperCase() === 'POST'){
    const currentUser = await getCurrentUser(request);
    // if currentUser is undefined or null
    if (!currentUser) return responseUtils.basicAuthChallenge(response);  
    // checking Authorization credentials
    const compare = getCredentials(request);
    const checkingPassword = await currentUser.checkPassword(compare[1]);
    if (!checkingPassword) return responseUtils.basicAuthChallenge(response);
    if (currentUser.role !== "admin") return responseUtils.forbidden(response);
    // no aboue issues
    // create new product
    // Fail if not a JSON request, don't allow non-JSON Content-Type
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }
    
    const product = await parseBodyJson(request);
    return await createProduct(response, product);
  }

  /** ORDERS */
  // Get all orders
  if (filePath === '/api/orders' && method.toUpperCase() === 'GET'){
    const currentUser = await getCurrentUser(request);
    // if currentUser is undefined or null
    if (!currentUser) return responseUtils.basicAuthChallenge(response);  
    // if currentUser exist, check password
    const compare = getCredentials(request);
    const checkingPassword = await currentUser.checkPassword(compare[1]);
    // password is wrong
    if (!checkingPassword) return responseUtils.basicAuthChallenge(response);   
    // no above issues
    if (currentUser.role === "admin") return await getAllOrders(response);
    if (currentUser.role === "customer") return await getAllOrdersByCustomer(response, currentUser._id);   
  }

  // View single order
  if (matchOrderId(filePath)){
    const currentUser = await getCurrentUser(request);
    // if currentUser is undefined or null
    if (!currentUser) return responseUtils.basicAuthChallenge(response);  
    // if currentUser exist, check password
    const compare = getCredentials(request);
    const checkingPassword = await currentUser.checkPassword(compare[1]);
    // password is wrong
    if (!checkingPassword) return responseUtils.basicAuthChallenge(response);   
    // no above issues
    const orderID = filePath.split("/")[3];  
    // if customer, then return own order
    // if admin, return all orders  
    if (method.toUpperCase() === 'GET') {
      return await viewOrder(response, orderID, currentUser);
    }
  }

  // Add new order
  if (filePath === '/api/orders' && method.toUpperCase() === 'POST'){
    const currentUser = await getCurrentUser(request);
    // if currentUser is undefined or null
    if (!currentUser) return responseUtils.basicAuthChallenge(response);  
    // if currentUser exist, check password
    const compare = getCredentials(request);
    const checkingPassword = await currentUser.checkPassword(compare[1]);
    // password is wrong
    if (!checkingPassword) return responseUtils.basicAuthChallenge(response);   
    // admin credentials are not allowed create orders
    if (currentUser.role === "admin") return responseUtils.forbidden(response);
    // no above issues
    // create new product
    // Fail if not a JSON request, don't allow non-JSON Content-Type
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }
    
    const order = await parseBodyJson(request);
    return await createOrder(response, order, currentUser._id);
  }

};
module.exports = { handleRequest };
