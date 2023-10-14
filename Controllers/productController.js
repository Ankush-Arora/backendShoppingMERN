// const ErrorHandler = require('../Utils/errorHandler');
const { isAuthenticatedUser, authorizeRoles } = require('../Middleware/auth');
const ApiFeatures = require('../Utils/ApiFeatures');
const ErrorHandler = require('../Utils/errorHandler');
const Product = require('./../Entity/productEntity')
const express = require('express');
const router = express.Router();
require('../Database/db')

// to add new Products
router.post('/addProduct', isAuthenticatedUser, authorizeRoles("admin"), async (req, resp) => {

    req.body.user = req.user.id

    const product = new Product(req.body)
    await product.save();
    resp.send(
        {
            success: true, product: product
        }
    )
})

// Get Single Product
router.get('/getProduct/:id', async (req, resp, next) => {

    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            console.log("In product not found")
            return resp.status(500).json({ success: false, message: "Product Not Found" })
            // return next(new ErrorHandler("Product Not found using error handler",404))
        }
        // product=await Product.findByIdAndUpdate(req.params.id,req.body);
        return resp.status(200).json({ message: "Product get Successfully", product: product })
    }
    catch (error) {
        return resp.status(500).json({ success: false, message: "Prodct Not Found in the database" })
    }
})

//To update new Products

router.put('/updateProduct/:id', isAuthenticatedUser, authorizeRoles("admin"), async (req, resp) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return resp.status(500).json({ success: false, message: "Prodct Not Found" })
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body);
    return resp.status(200).json({ message: "Product Updated Successfully", product: product })
})

//To update new Products
router.delete('/deleteProduct/:id', isAuthenticatedUser, authorizeRoles("admin"), async (req, resp) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return resp.status(500).json({ success: false, message: "Product Not Found" })
    }
    const deleted = await product.deleteOne();
    return resp.status(200).json({ message: "Product Has been deleted Successfully", product: deleted })
})

router.get('/getAllProducts', isAuthenticatedUser, async (req, resp) => {

    try {
        const resultPerPage = 2;
        const apiFeatures = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage);
        const productCount = await Product.countDocuments();
        //  const allProducts= await Product.find();
        const allProducts = await apiFeatures.query;
        resp.status(200).json({ success: "true", allProducts, productCount });
    }
    catch {
        resp.status(200).json({ success: "false", message: "Login first to get data" });
    }
})

// adding reviews
router.put('/review', isAuthenticatedUser, async (req, resp, next) => {
    // console.log("testing 0");
    try {
        const { rating, comment, productId } = req.body;
        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
        };
        // console.log("testing 1");
        const product = await Product.findById(productId);
        const isReviewed = product.reviews.find(
            (rev) => rev.user.toString() === req.user._id.toString()
        );

        if (isReviewed) {
            product.reviews.forEach((rev) => {
                if (rev.user.toString() === req.user._id.toString())
                    (rev.rating = rating), (rev.comment = comment);
            });
        }
        else {
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length
        }

        let average = 0;
        product.reviews.forEach((rev) => {
            average += rev.rating;
        })

        product.rating = average / product.reviews.length;

        await product.save({ validateBeforeSave: false });

        return resp.status(200).json({ success: true, message: "You have given the review" })
    }
    catch {
        return resp.status(500).json({ success: false, message: "Your review have not updated due to some error" })
    }

})

// Get All review for a product
router.get('/allReviews', isAuthenticatedUser, async (req, resp) => {

    try {
        const product = await Product.findById(req.query.id);

        if(!product)
        {
            return resp.status(500).json({success:false,message:"Product not found"});
        }

        return resp.status(200).json({success:true,reviews:product.reviews});
    }
    catch {
        return resp.status(500).json({success:false,message:"Some error occured"});
    }
})

// delete review
router.delete('/deleteReview',async(req,resp)=>{

    try{
        const product=await Product.findById(req.query.productId);

        if(!product)
        {
            return resp.status(500).json({success:false,message:"Product Not found"});
        }
        const reviews=product.reviews.filter((rev)=>rev._id.toString()!== req.query.id.toString());
        let average = 0;
        product.reviews.forEach((rev) => {
            average += rev.rating;
        })

       const rating = average / reviews.length;
        const numOfReviews=reviews.length;

        await Product.findByIdAndUpdate(req.query.productId,{
            reviews,rating,numOfReviews
        },{new:true,runValidators:true,useFindAndModify:false});

       return resp.status(200).json({success:true,message:"Review has been deleted"})
    }
    catch{
        return resp.status(500).json({success:false,message:"Could not deleted some error occured"})
    }
})

module.exports = router
