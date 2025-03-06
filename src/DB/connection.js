import mongoose from "mongoose";
const dbConnection = async () => {

    return await mongoose.connect(process.env.DB_URI).then(res => {
        console.log("DB is connected")
    }).catch(err => {
        console.log("fail to connect on DB")
    })
}


export default dbConnection