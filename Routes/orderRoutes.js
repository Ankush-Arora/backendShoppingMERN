const express=require("express")
const router=express.Router();

const {isAuthenticatedUser,authorizeRoles} =require("../Middleware/auth");
const { newOrder,check, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require("../Controllers/orderController");

router.route("/placeNewOrder").post(isAuthenticatedUser,newOrder);

router.route('/getSingleOrder/:id').get(isAuthenticatedUser,authorizeRoles("admin"),getSingleOrder);
router.route('/updateOrder/:id').put(isAuthenticatedUser,authorizeRoles("admin"),updateOrder);
router.route('/deleteOrder/:id').delete(isAuthenticatedUser,authorizeRoles("admin"),deleteOrder);
router.route('/getAllOrders').get(isAuthenticatedUser,authorizeRoles("admin"),getAllOrders);
router.route('/myOrders').get(isAuthenticatedUser,myOrders);
router.route("/test").get(check);

module.exports=router;