const Order=require('../Entity/ordersEntity')
// const Product=require('../Controllers/productController')
const Product=require('../Entity/productEntity')

exports.check=async(req,resp)=>{
    return resp.status(200).json({success:true,message:"Api running properly"});
}


exports.newOrder=async(req,resp)=>{
    // console.log("Testing 1");
    try{
    const {shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice}=req.body;
    // console.log("Testing 2");
    const order=await Order.create({
        shippingInfo,orderItems,user:req.user._id,paymentInfo, paidAt:Date.now(),itemsPrice,taxPrice,shippingPrice,totalPrice
    });
    // console.log("Testing 3");
    return resp.status(201).json({success:true,order});
}
catch{
    return resp.status(201).json({success:false,message:"Some error occured in Orders"});
}
}

exports.getSingleOrder=async(req,resp)=>{

    // try{
        console.log((req.params.id));
       // const order=await Order.findById((req.params.id)).populate("user",["name","email"]);
         const order=await Order.findById(req.params.id);
        console.log("Testing 2");
        if(!order)
        {
            return resp.status(200).json({success:true,message :"Order not found"});
        }
        return resp.status(200).json({success:true,order});
    // }
    // catch{
        // return resp.status(500).json({success:false,message :"Some error is occured not able to fetch order"});
    // }
}

exports.myOrders=async(req,resp)=>{

    try{
        const orders=await Order.find({user:req.user._id});
        if(!orders)
        {
            return resp.status(200).json({success:true,message :"You have not ordered anything yet"});
        }
        return resp.status(200).json({success:true,orders});
    }
    catch{
        return resp.status(500).json({success:false,message :"Some error is occured "});
    }
}
// getAllOrders for admin
exports.getAllOrders=async(req,resp)=>{

    try{
        const orders=await Order.find();
        if(!orders)
        {
            return resp.status(200).json({success:true,message :"There is no order"});
        }
        let totalAmount=0;

        orders.forEach((orderAmount)=>totalAmount+=orderAmount.totalPrice);
        return resp.status(200).json({success:true,totalAmount:totalAmount,orders});
    }
    catch{
        return resp.status(500).json({success:false,message :"Some error is occured "});
    }
}

// update order status
exports.updateOrder=async(req,resp)=>{

    try{
        // console.log("Testing 1");
        const order=await Order.findById(req.params.id);

        if(!order)
        {
            return resp.status(200).json({success:true,message:"Order not found with this ID"});
        }
        
        if(order.orderStatus==="Delivered")
        {
            return resp.status(200).json({success:true,message:"You have already delivered this order"});
        }
        order.orderItems.forEach(async(ord)=>{
            await updateStock(ord.product,ord.quantity);
        })
        order.orderStatus=req.body.status;
        
        if(req.body.status==="Delivered")
        {
            order.deliveredAt=Date.now();
        }
        // console.log("Testing 2");
        // await order.save({validateBeforeSave:false});
        await order.save({ validateBeforeSave: false });
        // console.log("Testing 3");
        return resp.status(200).json({success:true,message:"Order Updated successfully",order});
    }
    catch{
        return resp.status(500).json({success:false,message :"Some error is occured "});
    }
}

async function updateStock(id,quantity){
    // try{
 const product=await Product.findById(id);
 product.stock-=quantity;
//  await product.save({validateBeforeSave:false})
await product.save({ validateBeforeSave: false });
    // }
    // catch{
    //     return resp.status(500).json({success:false,message:"Some error occured in updateStock method"});
    // }
}

exports.deleteOrder=async(req,resp)=>{

    try{
        const order=await Order.findById(req.params.id);
        console.log("Testing 1");
        if(!order)
        {
            return resp.status(500).json({success:false,message :"Order not found with this id"});
        }
        console.log("Testing 2");
        await order.deleteOne();

        return resp.status(200).json({success:true,message:"Your order has been deleted"});
    }
    catch{
        return resp.status(500).json({success:false,message :"Some error occured "});
    }
}