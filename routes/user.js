const express = require('express')
const Router = express.Router();
const bcrypt = require('bcrypt')
const cloudinary = require('cloudinary').v2;
require('dotenv').config()
const User = require('../model/User')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const checkAuth = require('../middleware/checkAuth')



cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET// Click 'View API Keys' above to copy your API secret
});

Router.post('/signup', async (req, res) => {
    //console.log(req.body)
    //console.log(req.files)
    try {
        const users = await User.find({ email: req.body.email })
        if (users.length > 0) {
            return res.status(500).json({
                error: 'email is already registered'
            })
        }
        const hashcode = await bcrypt.hash(req.body.password, 10)
        // console.log(hashcode)
        const uploadedImage = await cloudinary.uploader.upload(req.files.logo.tempFilePath)
        //console.log(uploadedImage,hashcode)

        const newUser = new User({
            _id: new mongoose.Types.ObjectId,
            channelName: req.body.channelName,
            email: req.body.email,
            phone: req.body.phone,
            password: hashcode,
            logoUrl: uploadedImage.secure_url,
            logoId: uploadedImage.public_id
        })

        const user = await newUser.save()
        res.status(200).json({
            newUser: user
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

//login api-------------------------------------------------------------------------------------
Router.post('/login', async (req, res) => {
    try {
        console.log(req.body)
        const users = await User.find({ email: req.body.email })
        //console.log(users)
        if (users.length == 0) {
            return res.status(500).json({
                error: 'email is not registered'
            })
        }
        const isValid = await bcrypt.compare(req.body.password, users[0].password)
        // console.log(isValid)
        if (!isValid) {
            return res.status(500).json({
                error: 'invalid password'
            })
        }

        const token = jwt.sign({
            _id: users[0]._id,
            channelName: users[0].channelName,
            email: users[0].email,
            phone: users[0].phone,
            logoId: users[0].logoId
        },
            'sbs online classes 123',
            {
                expiresIn: '730d'
            }
        )

        res.status(200).json({
            _id: users[0]._id,
            channelName: users[0].channelName,
            email: users[0].email,
            phone: users[0].phone,
            logoId: users[0].logoId,
            logoUrl: users[0].logoUrl,
            token: token,
            subscriber: users[0].subscriber,
            subscribedChannel: users[0].subscribedChannel
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'something is wrong'
        })
    }
})

// subscribe api
Router.put('/subscribe/:userBId',checkAuth,async(req,res)=>{
    try {
        const userA = await jwt.verify(req.headers.authorization.split(" ")[1],'sbs online classes 123')
        console.log(userA)
        const userB = await User.findById(req.params.userBId)
        console.log(userB)
        if (userB.subscribedBy.includes(userA._id)) {
            return res.status(500).json({
                error: 'already subscribed....'
            })
        }

        // console.log('not subscribed....')
        userB.subscribers += 1
        userB.subscribedBy.push(userA._id)
        await userB.save()
        const userAFullInformation = await User.findById(userA._id)
        userAFullInformation.subscribedChannel.push(userB._id)
        await userAFullInformation.save()
        res.status(200).json({
            msg: 'subscribed....'
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })

    }
})

//unsubscribe api
Router.put('/unsubscribe/:userBId',checkAuth,async(req,res)=>{
    try
    {
        const userA = await jwt.verify(req.headers.authorization.split(" ")[1],'sbs online classes 123')
        const userB = await User.findById(req.params.userBId)
        console.log(userA)
        console.log(userB)
        if (userB.subscribedBy.includes(userA._id))
        {
           //unsubscribed logic
           userB.subscriber -= 1
           userB.subscribedBy = userB.subscribedBy.filter(userId=>userId.toString()!= userA._id)
           await userB.save()
           const userAFullInformation = await User.findById(userA._id)
           userAFullInformation.subscribedChannel =  userAFullInformation.subscribedChannel.filter(userId=>userId.toString()!= userB._id)
           await userAFullInformation.save()

           res.status(200).json({
            msg:'unsubscribed....'
           })

        }
        else
        {
            return res.status.json({
                error:'not subscribed...'
            })
        }
    }
    catch(error)
    {

    }
})

module.exports = Router