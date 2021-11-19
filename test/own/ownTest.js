// Test for HandleRequest
describe('handleRequest()', () => {
    // register new user
    describe('Registration: POST /api/register', () => {

      it('should respond with "400 Bad Request" when email is missing', async () => {
        
      });

      it('should respond with "400 Bad Request" when email is already in use', async () => {
       
      });

      it('should respond with "400 Bad Request" when name is missing', async () => {
        
      });

      it('should respond with "400 Bad Request" when password is missing', async () => {
      });

      it('should respond with "201 Created" when registration is successful', async () => {

       
      });

      it('should set user role to "customer" when registration is successful', async () => {

      });
    });

});

describe('UI Test', () =>{
    // UI test for registeration
    describe('UI: Register new user', () => {
        it('should create new user on successful registration', async () => {
        });
    });
    // UI test for shopping cart
    describe('UI: Shopping cart', () => {
        it('should show a notification about adding a product to shopping cart', async () => {

        });
    
        it('should show the product in shopping cart', async () => {
         
        });
    
        it('should increase the amount of items of a product in a shopping cart', async () => {
  
         
        });
    
        it('should decrease the amount of items of a product in a shopping cart', async () => {

        });
    
        it('should remove item from shopping cart when amount decreases to 0', async () => {
            
    
        });
    
        it("should increase the amount in shopping cart with each click on product's page", async () => {

        });
    
        it('should place order from the shopping cart', async () => {
        });
    
        it('should be able to add two different products to the shopping cart', async () => {
        });
    });
});
   
