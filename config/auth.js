const jwt = require('jsonwebtoken');
const tokenModel = require('../auth/model/token.model');
const userModel = require("../models/user.model");

module.exports.checkAuthentication = async function checkAuth(req, res, next) {
    try {
      const token = req.get('Authorization')?.split(' ')[1];
      // console.log('Token', token);
      const hasToken = token !== 'undefined' && token?.length > 0;  
      if (hasToken) {
        const tvalue = await tokenModel.findOne({ current_access_token: token });
        const decoded = jwt.verify(token, tvalue.access_token_secret);
        if (decoded) {
            // console.log(decoded);
            const user = await userModel.findById(decoded._id).exec();
            // console.log(user);
            if (user) {
                req.user = user;
                return next();
            }
            return res.status(400).json({
                message: "Not a valid User"
            });
        }
      }
      return res.status(400).json({
        message: "Token is required for authentication"
      });
    } catch (err) {
        console.log(`Server Authetication Error: ${err}`);
        return res.status(500).json({
            message: `Internal Server Error: ${err}`
        })
    }
}
