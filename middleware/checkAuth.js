const jwt = require('jsonwebtoken')

module.exports = async(req,res,next)=>{
    try
    {
        //console.log(req.headers)=postman mai joo token hai usko lane ka
        //console.log(req.headers.authorization)//iss line se we get string
        //conole.log(req.headers.authorization.split(" "))//we get array and split ke baad[1]=iise array ka second element mi raha hai
        //console.log(req.headers.authorization.split(" ")[1])//we get token

        const token = req.headers.authorization.split(" ")[1]
        await jwt.verify(token,'sbs online classes 123')
        next()
    }
    catch(err)
    {
        console.log(err)
        return res.status(500).json({
            error:'invalid token'
        })
    }
}