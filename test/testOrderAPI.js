const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const { handleRequest } = require('../routes');

const registrationUrl = '/api/register';
const usersUrl = '/api/users';
const productsUrl = '/api/products';
const ordersUrl = '/api/orders';
const contentType = 'application/json';
chai.use(chaiHttp);

const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');

// helper function for authorization headers
const encodeCredentials = (username, password) =>
  Buffer.from(`${username}:${password}`, 'utf-8').toString('base64');

// helper function for creating randomized test data
const generateRandomString = (len = 9) => {
  let str = '';

  do {
    str += Math.random()
      .toString(36)
      .substr(2, 9)
      .trim();
  } while (str.length < len);

  return str.substr(0, len);
};

// Get products (create copies for test isolation)
const products = require('../setup/products.json').map(product => ({ ...product }));

// Get users (create copies for test isolation)
const users = require('../setup/users.json').map(user => ({ ...user }));

const adminUser = { ...users.find(u => u.role === 'admin') };
const customerUser = { ...users.find(u => u.role === 'customer') };

const adminCredentials = encodeCredentials(adminUser.email, adminUser.password);
const customerCredentials = encodeCredentials(customerUser.email, customerUser.password);
const invalidCredentials = encodeCredentials(adminUser.email, customerUser.password);

const unknownUrls = [`/${generateRandomString(20)}.html`, `/api/${generateRandomString(20)}`];

describe('Routes', () => {
  let allUsers;
  let allProducts;
  let allOrders;

  // get randomized test user
  const getTestUser = () => {
    return {
      name: generateRandomString(),
      email: `${generateRandomString()}@email.com`,
      password: generateRandomString(10)
    };
  };

  const getTestProduct = () => {
    return {
      name: generateRandomString(),
      price: Math.floor(Math.random() * 50000) / 100,
      image: `http://www.images.com/${generateRandomString()}.jpg`,
      description: generateRandomString(75)
    };
  };

  const getTestOrder = () => {
    return {
      items: [
        {
          product: {
            _id: allProducts[1].id,
            name: allProducts[1].name,
            price: allProducts[1].price,
            description: allProducts[1].description
          },
          quantity: Math.floor(Math.random() * 5) + 1
        }
      ]
    };
  };

  beforeEach(async () => {
    await User.deleteMany({});
    await User.create(users);
    allUsers = await User.find({});

    await Product.deleteMany({});
    await Product.create(products);
    allProducts = await Product.find({});

    const orders = allUsers.map(user => {
      return {
        customerId: user.id,
        items: [
          {
            product: {
              _id: allProducts[0].id,
              name: allProducts[0].name,
              price: allProducts[0].price,
              description: allProducts[0].description
            },
            quantity: Math.floor(Math.random() * 5) + 1
          }
        ]
      };
    });

    await Order.deleteMany({});
    await Order.create(orders);
    allOrders = await Order.find({});
  });

  describe('handleRequest()', () => {

    /**
     *  Orders endpoints
     */
    // describe('Viewing all orders: GET /api/orders', () => {
    //   it('should respond with "401 Unauthorized" when Authorization header is missing', async () => {
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(ordersUrl)
    //       .set('Accept', contentType);

    //     expect(response).to.have.status(401);
    //   });

    //   it('should respond with Basic Auth Challenge when Authorization header is missing', async () => {
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(ordersUrl)
    //       .set('Accept', contentType);

    //     expect(response).to.have.status(401);
    //     expect(response).to.have.header('www-authenticate', /basic/i);
    //   });

    //   it('should respond with Basic Auth Challenge when Authorization credentials are incorrect', async () => {
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(ordersUrl)
    //       .set('Accept', contentType)
    //       .set('Authorization', `Basic ${invalidCredentials}`);

    //     expect(response).to.have.status(401);
    //     expect(response).to.have.header('www-authenticate', /basic/i);
    //   });

    //   it('should respond with Basic Auth Challenge when Authorization header is empty', async () => {
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(ordersUrl)
    //       .set('Accept', contentType)
    //       .set('Authorization', '');

    //     expect(response).to.have.status(401);
    //     expect(response).to.have.header('www-authenticate', /basic/i);
    //   });

    //   it('should respond with Basic Auth Challenge when Authorization header is not properly encoded', async () => {
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(ordersUrl)
    //       .set('Accept', contentType)
    //       .set('Authorization', `Basic ${adminUser.email}:${adminUser.password}`);

    //     expect(response).to.have.status(401);
    //     expect(response).to.have.header('www-authenticate', /basic/i);
    //   });

    //   it('should respond with "406 Not Acceptable" when Accept header is missing', async () => {
    //     const response = await chai.request(handleRequest).get(ordersUrl);
    //     expect(response).to.have.status(406);
    //   });

    //   it('should respond with "406 Not Acceptable" when client does not accept JSON', async () => {
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(ordersUrl)
    //       .set('Accept', 'text/html');

    //     expect(response).to.have.status(406);
    //   });

    //   it('should respond with JSON when admin credentials are received', async () => {
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(ordersUrl)
    //       .set('Accept', contentType)
    //       .set('Authorization', `Basic ${adminCredentials}`);

    //     expect(response).to.have.status(200);
    //     expect(response).to.be.json;
    //     expect(response.body).to.be.an('array');
    //   });

    //   it('should respond with JSON when customer credentials are received', async () => {
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(ordersUrl)
    //       .set('Accept', contentType)
    //       .set('Authorization', `Basic ${customerCredentials}`);

    //     expect(response).to.have.status(200);
    //     expect(response).to.be.json;
    //     expect(response.body).to.be.an('array');
    //   });

    //   it('should respond with correct data when admin credentials are received', async () => {
    //     const ordersData = JSON.parse(JSON.stringify(allOrders));
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(ordersUrl)
    //       .set('Accept', contentType)
    //       .set('Authorization', `Basic ${adminCredentials}`);

    //     expect(response).to.have.status(200);
    //     expect(response).to.be.json;
    //     expect(response.body).to.be.deep.equal(ordersData);
    //   });

    //   it('should respond with correct data when customer credentials are received', async () => {
    //     const customer = allUsers.find(
    //       user => user.email === customerUser.email && user.role === 'customer'
    //     );
    //     const ordersData = JSON.parse(
    //       JSON.stringify(allOrders.filter(order => order.customerId.toString() === customer.id))
    //     );
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(ordersUrl)
    //       .set('Accept', contentType)
    //       .set('Authorization', `Basic ${customerCredentials}`);

    //     expect(response).to.have.status(200);
    //     expect(response).to.be.json;
    //     expect(response.body).to.be.deep.equal(ordersData);
    //   });
    // });

    // describe('Viewing a single order: GET /api/orders/{id}', () => {
    //   let testOrder;
    //   let url;
    //   let unknownId;

    //   beforeEach(async () => {
    //     const customer = allUsers.find(
    //       user => user.email === customerUser.email && user.role === 'customer'
    //     );
    //     testOrder = await Order.findOne({ customerId: customer._id }).exec();
    //     url = `${ordersUrl}/${testOrder.id}`;
    //     unknownId = testOrder.id
    //       .split('')
    //       .reverse()
    //       .join('');
    //   });

    //   it('should respond with "401 Unauthorized" when Authorization header is missing', async () => {
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(url)
    //       .set('Accept', contentType);

    //     expect(response).to.have.status(401);
    //   });

    //   it('should respond with Basic Auth Challenge when Authorization header is missing', async () => {
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(url)
    //       .set('Accept', contentType);

    //     expect(response).to.have.status(401);
    //     expect(response).to.have.header('www-authenticate', /basic/i);
    //   });

    //   it('should respond with Basic Auth Challenge when Authorization credentials are incorrect', async () => {
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(url)
    //       .set('Accept', contentType)
    //       .set('Authorization', `Basic ${invalidCredentials}`);

    //     expect(response).to.have.status(401);
    //     expect(response).to.have.header('www-authenticate', /basic/i);
    //   });

    //   it('should respond with "406 Not Acceptable" when Accept header is missing', async () => {
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(url)
    //       .set('Authorization', `Basic ${adminCredentials}`);
    //     expect(response).to.have.status(406);
    //   });

    //   it('should respond with "406 Not Acceptable" when client does not accept JSON', async () => {
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(url)
    //       .set('Accept', 'text/html')
    //       .set('Authorization', `Basic ${adminCredentials}`);
    //     expect(response).to.have.status(406);
    //   });

    //   it('should respond with JSON when admin credentials are received', async () => {
    //     const orderData = JSON.parse(JSON.stringify(testOrder));
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(url)
    //       .set('Accept', contentType)
    //       .set('Authorization', `Basic ${adminCredentials}`);

    //     expect(response).to.have.status(200);
    //     expect(response).to.be.json;
    //     expect(response.body).to.be.an('object');
    //     expect(response.body).to.deep.equal(orderData);
    //   });

    //   it('should respond with JSON when customer credentials are received', async () => {
    //     const orderData = JSON.parse(JSON.stringify(testOrder));
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(url)
    //       .set('Accept', contentType)
    //       .set('Authorization', `Basic ${customerCredentials}`);

    //     expect(response).to.have.status(200);
    //     expect(response).to.be.json;
    //     expect(response.body).to.be.an('object');
    //     expect(response.body).to.deep.equal(orderData);
    //   });

    //   it('should respond with status code 404 when order does not exist', async () => {
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(`${ordersUrl}/${unknownId}`)
    //       .set('Accept', contentType)
    //       .set('Authorization', `Basic ${adminCredentials}`);

    //     expect(response).to.have.status(404);
    //   });

    //   it('should respond with status code 404 when order exists but the owner is not the current customer', async () => {
    //     const order = allOrders.find(
    //       order => order.customerId.toString() !== testOrder.customerId.toString()
    //     );
    //     const response = await chai
    //       .request(handleRequest)
    //       .get(`${ordersUrl}/${order.id}`)
    //       .set('Accept', contentType)
    //       .set('Authorization', `Basic ${customerCredentials}`);

    //     expect(response).to.have.status(404);
    //   });
    // });

    describe('Create a new order: POST /api/orders', () => {
      it('should respond with "406 Not Acceptable" when Accept header is missing', async () => {
        const order = getTestOrder();
        const response = await chai
          .request(handleRequest)
          .post(ordersUrl)
          .set('Authorization', `Basic ${customerCredentials}`)
          .send(order);
        expect(response).to.have.status(406);
      });

      it('should respond with "406 Not Acceptable" when client does not accept JSON', async () => {
        const order = getTestOrder();
        const response = await chai
          .request(handleRequest)
          .post(ordersUrl)
          .set('Accept', 'text/html')
          .set('Authorization', `Basic ${customerCredentials}`)
          .send(order);
        expect(response).to.have.status(406);
      });

      it('should respond with "401 Unauthorized" when Authorization header is missing', async () => {
        const order = getTestOrder();
        const response = await chai
          .request(handleRequest)
          .post(ordersUrl)
          .set('Accept', contentType)
          .send(order);

        expect(response).to.have.status(401);
      });

      it('should respond with Basic Auth Challenge when Authorization header is missing', async () => {
        const order = getTestOrder();
        const response = await chai
          .request(handleRequest)
          .post(ordersUrl)
          .set('Accept', contentType)
          .send(order);

        expect(response).to.have.status(401);
        expect(response).to.have.header('www-authenticate', /basic/i);
      });

      it('should respond with Basic Auth Challenge when Authorization credentials are incorrect', async () => {
        const order = getTestOrder();
        const response = await chai
          .request(handleRequest)
          .post(ordersUrl)
          .set('Accept', contentType)
          .set('Authorization', `Basic ${invalidCredentials}`)
          .send(order);

        expect(response).to.have.status(401);
        expect(response).to.have.header('www-authenticate', /basic/i);
      });

      it('should respond with "403 Forbidden" when admin credentials are received', async () => {
        const order = getTestOrder();
        const response = await chai
          .request(handleRequest)
          .post(ordersUrl)
          .set('Accept', contentType)
          .set('Authorization', `Basic ${adminCredentials}`)
          .send(order);

        expect(response).to.have.status(403);
      });

      it('should respond with "400 Bad Request" when request body is not valid JSON', async () => {
        const body = JSON.stringify(getTestOrder()).substring(1);
        const response = await chai
          .request(handleRequest)
          .post(ordersUrl)
          .set('Accept', contentType)
          .set('Authorization', `Basic ${customerCredentials}`)
          .send(body);
        expect(response).to.have.status(400);
      });

      it('should respond with "400 Bad Request" when items is empty', async () => {
        const order = getTestOrder();
        order.items = [];

        const response = await chai
          .request(handleRequest)
          .post(ordersUrl)
          .set('Accept', contentType)
          .set('Authorization', `Basic ${customerCredentials}`)
          .send(order);

        expect(response).to.have.status(400);
        expect(response).to.be.json;
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('error');
      });

      it('should respond with "400 Bad Request" when quantity is missing', async () => {
        const order = getTestOrder();
        delete order.items[0].quantity;

        const response = await chai
          .request(handleRequest)
          .post(ordersUrl)
          .set('Accept', contentType)
          .set('Authorization', `Basic ${customerCredentials}`)
          .send(order);

        expect(response).to.have.status(400);
        expect(response).to.be.json;
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('error');
      });

      it('should respond with "400 Bad Request" when product is missing', async () => {
        const order = getTestOrder();
        delete order.items[0].product;

        const response = await chai
          .request(handleRequest)
          .post(ordersUrl)
          .set('Accept', contentType)
          .set('Authorization', `Basic ${customerCredentials}`)
          .send(order);

        expect(response).to.have.status(400);
        expect(response).to.be.json;
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('error');
      });

      it('should respond with "400 Bad Request" when product _id is missing', async () => {
        const order = getTestOrder();
        delete order.items[0].product._id;

        const response = await chai
          .request(handleRequest)
          .post(ordersUrl)
          .set('Accept', contentType)
          .set('Authorization', `Basic ${customerCredentials}`)
          .send(order);

        expect(response).to.have.status(400);
        expect(response).to.be.json;
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('error');
      });

      it('should respond with "400 Bad Request" when product name is missing', async () => {
        const order = getTestOrder();
        delete order.items[0].product.name;

        const response = await chai
          .request(handleRequest)
          .post(ordersUrl)
          .set('Accept', contentType)
          .set('Authorization', `Basic ${customerCredentials}`)
          .send(order);

        expect(response).to.have.status(400);
        expect(response).to.be.json;
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('error');
      });

      it('should respond with "400 Bad Request" when price is missing', async () => {
        const order = getTestOrder();
        delete order.items[0].product.price;

        const response = await chai
          .request(handleRequest)
          .post(ordersUrl)
          .set('Accept', contentType)
          .set('Authorization', `Basic ${customerCredentials}`)
          .send(order);

        expect(response).to.have.status(400);
        expect(response).to.be.json;
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('error');
      });

      it('should respond with "201 Created" when order creation is successful', async () => {
        const order = getTestOrder();

        const response = await chai
          .request(handleRequest)
          .post(ordersUrl)
          .set('Accept', contentType)
          .set('Authorization', `Basic ${customerCredentials}`)
          .send(order);

        const orders = await Order.find({}).exec();
        const createdOrder = orders.find(o => o.id === response.body._id);
        const orderData = JSON.parse(JSON.stringify(createdOrder));

        expect(response).to.have.status(201);
        expect(response).to.be.json;
        expect(response.body).to.be.an('object');
        expect(createdOrder).to.not.be.null;
        expect(createdOrder).to.be.an('object');
        expect(response.body).to.deep.equal(orderData);
      });
    });
  });
});
