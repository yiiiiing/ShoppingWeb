/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request
 * @returns {Object|null} current authenticated user or null if not yet authenticated
 */

const { getCredentials } = require('../utils/requestUtils');
//const {getUser} = require('../utils/users');
const User = require("../models/user");

const getCurrentUser = async request => {
  // TODO: 8.5 Implement getting current user based on the "Authorization" request header

  // NOTE: You can use getCredentials(request) function from utils/requestUtils.js
  // and getUser(email, password) function from utils/users.js to get the currently
  // logged in user
  const credentials = getCredentials(request);
  if (credentials !== null)
  {
    // get current user based on email 
    if (credentials.length === 2){
      //const currentUser =  getUser(credentials[0], credentials[1]);

      // find one user with an email credentials[0]
      const emailUser = await User.findOne({ email: credentials[0] }).exec();
      if (emailUser !== undefined && emailUser !== null && await emailUser.checkPassword(credentials[1])) {
        // password is correct
        return emailUser;
      }
    }

  }
  return null;
};

module.exports = { getCurrentUser };