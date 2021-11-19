# ShoppingWeb
This final project in Web1 course, mainly learning some frontend (like simple html and css and using js to write html based on the html tamplate and the interaction with buttons, input texts), and some backend (like, using mongoose to handle with the dataset and user identity authentication and sending related response), and some mocha test (like, how to use mocha to test our features).

## The project structure

```
.
├── index.js                --> start the backend server
├── package.json            --> set main, scripts, dependencies, devDependencies
├── routes.js               --> the router and is responsible for deciding what should be done based on the request. (e.g. JSON endpoints are served from URLs starting with /api For example listing of all users can be retrieved from /api/users with a GET request)
├── auth                    
│   └──  auth.js            --> get current user informantion for authentication.
├── controllers             --> control order, product and user...
│   ├──  orders.js          --> add order, get order, view order...
|   ├──  products.js        --> add product, update product, get products
│   └── users.js            --> get user for admin role, update user info, delete user...
├── models                  --> set mongoose schema
│   ├──  db.js              
│   ├──  orders.js          
│   ├──  products.js        
│   ├──  user.js            
│                               
├── public                  --> All static files that are accessible from the browser
│   ├── img                  
│   ├── js                  
│   └── css                 
├── utils                   --> Helper functions for different purposes, intended to be used by other modules
│   ├── render.js           --> this module is responsible for serving files from "public/" 
│   └── requestUtils.js     --> parse request body
│   └── responseUtils.js    --> define different types of responses
│   └── users.js            --> get user infos but not needed after using mongoDB

└── test                    --> tests
│   ├── auth                
│   ├── controllers    
│   ├── api                 
```

## Setup the project
### Installing Node.js 
> Node.js is a JavaScript runtime environment that executes JavaScript code outside of a web browser. It's useful to check the backend server and database rather than evaluating codes ina browser environment.

There are two options to install node.js
- Using Vagrant (a tool for building and managing virtual machine environments) to create and run a development environment on your machineusing Vagrant on your own machine. Vagrant provides both Node.js and MongoDB. 
- Direct install of Node to your own machine

### Using Vagrant
1. Install VirtualBox, which is used by Vagrant. [Virtualbox downloads](https://www.virtualbox.org/wiki/Downloads)
2. Install Vagrant. [Vagrant downloads](https://www.vagrantup.com/downloads)
3. Setup and access the virtual environment by using files, Vagrantfile and /vagrant folder (holds the _provision.sh_ file)
    - In the root directory of this repository where the _Vagrantfile_ is, first run this command: `vagrant help`, which will list the available Vagrant commands.
    - Start the configuration and setting up of the virtual environment with this command: `vagrant up`, which will fetch a image of Ubuntu for the virtual machine and run all the installation steps defined in _provision.sh_.
    - Connect to the running virtual environment with this command: `vagrant ssh`, after which, we are in the virtual environment. All the files in repository are linked in the directory _/webdev1_ of your virtaul environment and access this folder with the command : 
    `_cd /webdev1_`.

> Ports 3000 for Node and 27017 for MongoDB are open from the virtual environment to the same port numbers of the host system (own computers operating system). So, if we run a Node server in our virtual environment on the port 3000, we can access it from the host system with our browser using the address _localhost:3000_.

    - Use command `vagrant halt` to shut down the machine (when not logged in with ssh)

    - Use command `vagrant destroy` to delete the whole virtual machine   

> Note: If getting an error: symlink error, error -71, etc. with vagrant, use the parameter --no-bin-links.
Check https://github.com/npm/npm/issues/7308 and http://perrymitchell.net/article/npm-symlinks-through-vagrant-windows/
 
### Direct install of Node 
Direct install of Node.js is instructed in the Handson video which is  in the first lecture week course slide. 

In *Linux*: 

`node -v`

`curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.35.3/install.sh -o install_nvm.sh`

`bash install_nvm.sh`

`source ~/.profile`

`nvm install 14.9.0`

`nvm use 14.9.0`

`node -v`

In *Windows*: follow [Microsoft's own instructions for Node installation](https://docs.microsoft.com/en-us/windows/nodejs/setup-on-windows).

### Some useful commands
- Install libraries: `npm install`
- Start backend server: `npm run nodemon`
- Test: `npm run test` (need to set in package.json)
- Test specific function:  `npm run test-8.3 -- -g 'getUserById\('`



