const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");
const { userTwo } = require("../../tests/fixtures/user.fixture");
const { User } = require("../models");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  const cart = await Cart.findOne({email:user.email}).exec();
  if(cart)
  { 
    return cart;
  }
  else
  {
    throw new ApiError(404,"User does not have a cart");
  }
 
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  const product = await Product.findOne({_id:productId}).exec();
  if(!product)
  {
    throw new ApiError(400,"Product doesn't exist in database");
  }
  let cart = await Cart.findOne({email:user.email}).exec();
 

  if(cart)
  { 
    cart=cart.toObject();
    const cartItemsFromThisCart=cart.cartItems;
    for(let i=0;i<cartItemsFromThisCart.length;++i)
    {
      if(cartItemsFromThisCart[i].product._id == productId)
      {
        throw new ApiError(400,"Product already in cart. Use the cart sidebar to update or remove product from cart");
      }
    }
    cartItemsFromThisCart.push({product:product,quantity:quantity});
    await Cart.findOneAndUpdate({email:user.email},{cartItems:cartItemsFromThisCart});
    return cart;
  }
  else
  {
    try{
      const item= [{product:product,quantity:quantity}];
    const cart =await Cart.create({email:user.email,
      paymentOption: user.paymentOption,
    cartItems: item});
    return cart;
    }
    catch(err)
    {
      throw new ApiError(500,"");
    }
  }
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  const product = await Product.findOne({_id:productId}).exec();
  if(!product)
  {
    throw new ApiError(400,"Product doesn't exist in database");
  }
  let cart = await Cart.findOne({email:user.email}).exec();
  if(cart)
  { 
    cart=cart.toObject();
    const cartItemsFromThisCart=cart.cartItems;
    let found = false;
    for(let i=0;i<cartItemsFromThisCart.length;++i)
    {
      if(cartItemsFromThisCart[i].product._id == productId)
      {
        cartItemsFromThisCart[i].quantity=quantity;
        found=true;
        break;
        
      }
    }
    if(!found)
    {
      throw new ApiError(400,"Product not in cart");
    }

    await Cart.findOneAndUpdate({email:user.email},{cartItems:cartItemsFromThisCart});
    return cart;
  }
  else
  {
       throw new ApiError(400,"User does not have a cart. Use POST to create cart and add a product");
  }
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  let cart = await Cart.findOne({email:user.email}).exec();
  cart=cart.toObject();
    const cartItemsFromThisCart=cart.cartItems;
    const newItemsForThisCart = [];
    for(let i=0;i<cartItemsFromThisCart.length;++i)
    {
      if(cartItemsFromThisCart[i].product._id != productId)
      {
        newItemsForThisCart.push(cartItemsFromThisCart[i]);    
      }
    }

    await Cart.findOneAndUpdate({email:user.email},{cartItems:newItemsForThisCart});
    return cart;
};


// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {
  let isMockPresent = false;
  if(user.hasSetNonDefaultAddress)
  {
    isMockPresent = true;
  }
  if(!(user instanceof User) && !isMockPresent)
  {
    user = new User(user);
  }
  const isAdrressNonDefault = await user.hasSetNonDefaultAddress();
  if(!isAdrressNonDefault)
  {
    throw new ApiError(400,"User address not set");
  }
  let cart = await getCartByUser(user);
  cart = cart.toObject();
  if(cart.cartItems.length==0)
  {
    throw new ApiError(400,"User does not have any item in cart");
  }

  let total=0;
  for(let i=0;i<cart.cartItems.length;++i)
  {
     total = total + (cart.cartItems[i].product.cost * cart.cartItems[i].quantity);
  }

  if(user.walletMoney<total)
  {
    throw new ApiError(400,"Wallet balance is insufficient");
  }

  user.walletMoney = user.walletMoney - total;
  cart.cartItems = [];
  // await User.updateOne({_id:user.id});
  // await Cart.updateOne
  await User.updateOne({_id:user.id},{walletMoney:user.walletMoney});
  await Cart.updateOne({email:user.email},{cartItems:[]});

};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
