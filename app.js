const express = require('express')
const app = express();
const mongoose = require('mongoose')
require('dotenv').config()
const userRoute = require('../tube api/routes/user')
const videoRoute = require('../tube api/routes/video')
const commentRoute = require('../tube api/routes/comment')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const cors = require('cors')

//mongoose.connect(process.env.MONGO_URI)
// .then(res=>{
//     console.log('connected with database')
// })
// .catch(err=>{
//     console.log(err)
// })

const connectedWithDatabase = async()=>{   
    try
    {
        const res = await mongoose.connect(process.env.MONGO_URI)
        console.log('connected with database')
    }
    catch(err)
    {
        console.log(err)
    }
}
connectedWithDatabase ()

app.use(cors())
app.use(bodyParser.json())
app.use(fileUpload({
    useTempFiles : true,
    //tempFileDir : '/tmp/'
}));

app.use('/user',userRoute)
app.use('/video',videoRoute)
app.use('/comment',commentRoute)


module.exports = app;