const mongoose=require('mongoose');
const dotenv=require('dotenv');
dotenv.config({path:'./Config/config.env'})

const DB=process.env.DATABASE
mongoose.connect(DB).then((connected)=>{
console.log("Connecter to database Shopping Atlas");
}).catch(()=>{
    console.log("Not connected to database")
})