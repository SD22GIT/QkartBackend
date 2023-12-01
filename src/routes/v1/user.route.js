const express = require("express");
const validate = require("../../middlewares/validate");
const userValidation = require("../../validations/user.validation");
const userController = require("../../controllers/user.controller");
const { loggers } = require("winston");
const Users = require("../../models/user.model");
const router = express.Router();

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement a route definition for `/v1/users/:userId`

//console.log(userValidation.getUser.params);
router.get("/:userId",validate(userValidation.getUser),(req,resp)=>getUser(req,resp));

function getUser(req,res)
{
    Users.find({_id:req.params.userId}, (err, docs) => {
  
        if (err) {
          console.log(err);
          res.status(500).send();
        } else {
          res.send(docs);
        }
      });
}

module.exports = router;
