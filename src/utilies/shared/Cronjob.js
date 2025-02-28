import cron from 'node-cron';
import * as DbServices from '../../DB/dbServices.js'
import { userModel } from '../../DB/models/User.model.js';



export const startCronJob=()=>{
const cronJob= cron.schedule('* * */6 * * *', async() => {
console.log("Running CRON job: Deleting expired OTPs from users...");
const users= await DbServices.find({model:userModel,
filter:{"Otp.expiresIn":{$lt:new Date()}} //"Otp.expiresIn" this way to access object inside array
})

for (const user of users) {
user.Otp = user.Otp.filter((otp) => otp.expiresIn > new Date());
await user.save();
}

console.log("CRON job completed.");      
cronJob.stop();

setTimeout(() => {
    console.log("Restarting CRON job...");
    cronJob.start();
}, 6 * 60 * 60 * 1000); // will restart again after 6 hour because i stopped it manually by cronJob.stop();

});


return cronJob
}


