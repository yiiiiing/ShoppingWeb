/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response
 */
 const User = require("../models/user");
 const responseUtils = require('../utils/responseUtils');


const getAllUsers = async response => {
  // TODO: 10.2 Implement this
  const users = await User.find({});
  return responseUtils.sendJson(response, users);   
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 */
const deleteUser = async(response, userId, currentUser) => {
  const checkId = await User.findById(userId).exec();
  // check if user id exists
  if (checkId === undefined || checkId === null){
    return responseUtils.notFound(response);
  }
  if (userId === currentUser.id) return responseUtils.badRequest(response, "Deleting own data is not allowed");
  await User.deleteOne({ _id: checkId.id });
  return responseUtils.sendJson(response, checkId);
};

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 * @param {Object} userData JSON data from request body
 */
const updateUser = async(response, userId, currentUser, userData) => {
  // TODO: 10.2 Implement this
  const checkId = await User.findById(userId).exec();
  // check if user id exists
  if (checkId === undefined || checkId === null){
    return responseUtils.notFound(response);
  }


  // if userData's role is unknown
  if (!(userData.role === "admin" || userData.role === "customer")) return responseUtils.badRequest(response, "Uncaught Error: Unknown role");
  // if 2 user's role is customer
  if (userId === currentUser.id)  return responseUtils.badRequest(response, "Updating own data is not allowed");

  // update role
  checkId.role = userData.role;
  await checkId.save();
  return responseUtils.sendJson(response, checkId);
};

/**
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 */
const viewUser = async(response, userId, currentUser) => {
  // TODO: 10.2 Implement this
  
  const checkId = await User.findById(userId).exec();
  // check if user id exists
  if (checkId === undefined || checkId === null){
    return responseUtils.notFound(response);
  }
  return responseUtils.sendJson(response, checkId);
};

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response
 * @param {Object} userData JSON data from request body
 */
const registerUser = async(response, userData) => {
  // TODO: 10.2 Implement this

  // check erros
  const user = userData;
  const errors = [];
  if (!user.name) errors.push('Missing name');
  if (!user.email) errors.push('Missing email');
  else {
    if (!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(user.email))){
      errors.push('Email is not valid');
    }
  }

  if (!user.password) errors.push('Missing password');
  else {
    if (user.password.length < 10) errors.push("Password is too short.");
  }
  
  if (await User.findOne({ email: user.email }).exec()){
    errors.push("Email is already in use");
  }

  // if exist errors, then return badRequest
  if (errors.length > 0) return responseUtils.badRequest(response, errors);
  
  // creating and saving a new user  
  const newUserData = 
    {
      name: user.name,
      email: user.email,
      password:user.password,
      role: "customer"
    };
  
  const newUser = new User(newUserData);
  newUser.role = "customer";
  await newUser.save();
  return responseUtils.createdResource(response, newUser);
};

module.exports = { getAllUsers, registerUser, deleteUser, viewUser, updateUser };