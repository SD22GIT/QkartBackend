const express = require("express");
const validate = require("../../middlewares/validate");
const authValidation = require("../../validations/auth.validation");
const authController = require("../../controllers/auth.controller");

const router = express.Router();

// TODO: CRIO_TASK_MODULE_AUTH - Implement "/v1/auth/register" and "/v1/auth/login" routes with request validation
router.post("/register",validate(authValidation.register),(req,resp,next)=>{authController.register(req,resp,next)});
router.post("/login",validate(authValidation.login),(req,resp,next)=>{authController.login(req,resp,next)});

module.exports = router;
