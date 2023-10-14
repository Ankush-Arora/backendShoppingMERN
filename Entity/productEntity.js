const mongoose=require('mongoose')

const productSchema=mongoose.Schema({
    name:{type:String,required:[true,"Please Enter product Name"],trim:true   },
    description:{type:String, required:[true,"Please enter product description"]  },
    price:{type:Number,required:[true,"Please Enter product Price"],maxLength:[8,"Price can not exceed 8 character"]},
    rating:{type:Number,default:0},
    images:[{public_id:{type:String,required:true},url:{type:String,required:true}}],
    category:{type:String,required:[true,"Please Enter Product Category"]},
    stock:{type:Number,required:[true,"Please Enter product Stock"],
            maxLength:[4,"Stock cannot exceed 4 character"],default:1},
    numOfReviews:{ type:Number,default:0},
    reviews:[
        {
            user:{type:mongoose.Schema.ObjectId,ref:"User",required:true,},
            name:{type:String,required:true},
            rating:{type:Number,required:true},
            comment:{type:String,require:true}
        }   ],
        user:{type:mongoose.Schema.ObjectId,ref:"User",required:true,},
    created:{type:Date,default:Date.now}
})

const ProductModel=mongoose.model('product',productSchema)
module.exports=ProductModel
