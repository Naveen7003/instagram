const mongoose = require('mongoose')

exports.dbconnection = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("connection Established!")
    }catch(error){
        console.log(error.message);
    }
}   