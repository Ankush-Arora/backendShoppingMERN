const express=require('express')
const app=express();
const dotenv=require('dotenv')
const cookieParser=require("cookie-parser")
dotenv.config({path:'./Config/config.env'})
const order=require('./Routes/orderRoutes')
require('./Database/db')
const router = express.Router();
app.use(express.json())
const errorMiddleware=require("./Middleware/error");

app.use(errorMiddleware)
app.use(cookieParser());

app.use('/',order);

app.get('/',(req,resp)=>{
    resp.status(200).json({execution:"successfull"});
})

app.use('/',require('./Controllers/productController'))
app.use('/',require('./Controllers/userController'))

app.listen(process.env.PORT,()=>{
    console.log(`your app is running on server http://localhost/5000`)
})
module.exports=app
