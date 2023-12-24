const mongoose = require('mongoose');
const { productSchema } = require('./product.model');
const config = require("../config/config")

// TODO: CRIO_TASK_MODULE_CART - Complete cartSchema, a Mongoose schema for "carts" collection
const item = mongoose.Schema(
  {
    product: productSchema,
    quantity:{
      type:Number,
    }
  }
);

const cartSchema = mongoose.Schema(
  {
    email: {
      type:String,
      required: true,
      trim: true,
    },
    cartItems:[item],
    paymentOption: {
      type:String,
      required: true,
      trim: true,
      default: config.default_payment_option
    }
  },
  {
    timestamps: false,
  }
);


/**
 * @typedef Cart
 */
const Cart = mongoose.model('Cart', cartSchema);

module.exports.Cart = Cart;