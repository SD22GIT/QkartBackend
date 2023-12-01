const express = require("express");
const validate = require("../../middlewares/validate");
const userValidation = require("../../validations/user.validation");
const userController = require("../../controllers/user.controller");
const { loggers } = require("winston");
const { User } = require("../../models/user.model");
const router = express.Router();

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement a route definition for `/v1/users/:userId`

//console.log(userValidation.getUser.params);
router.get("/:userId",validate(userValidation.getUser),(req,res,next)=>{userController.getUser(req,res,next)});

// function getUser(req,res)
// {
//    userController.getUser(req,res,next);
// }

module.exports = router;
