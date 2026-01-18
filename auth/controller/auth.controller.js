const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const token = require('../model/token.model');
const user = require('../../models/user.model');
const callApi = require('../../util/callApi');

const createTokens = (payload) => {
    const access_token_secret = crypto.randomBytes(64).toString('hex');
    const refresh_token_secret = crypto.randomBytes(64).toString('hex');
    const access_token = jwt.sign(payload, access_token_secret, { expiresIn: process.env.TOKEN_EXPIRES_IN ?? '1d' });
    const refresh_token = jwt.sign(payload, access_token_secret, { expiresIn: process.env.TOKEN_EXPIRES_IN ?? '1d' });
    return {
        access_token_secret,
        access_token,
        refresh_token_secret,
        refresh_token
    };
};

module.exports.createTokens = async (req, res, next) => {
    try {
        const { _doc } = { ...res.locals };
        // console.log('Create Tokens :', _doc);

        // console.log(process.env);

        const { access_token_secret, access_token, refresh_token_secret, refresh_token } = createTokens(_doc);

        const result = await callApi(
            `${process.env.HELPDICE_API_URL}/api/v1//auth/latest_token?username=${_doc.phoneNo}`,
            'GET',
            null,
            {
                'HB-API-KEY': `Bearer ${process.env.HELPDICE_API_KEY}`
            }
        );

        // console.log('Helpdice Token :', result);

        await token.findOneAndUpdate(
            { user_id: res.locals._id },
            {
                access_token_secret,
                refresh_token_secret,
                current_access_token: access_token,
                user_id: res.locals._id
            },
            { upsert: true }
        );

        return res
            .status(200)
            .json({ ..._doc, tokens: { access_token, refresh_token, helpdice_token: result?.token }, message: 'success' });
    } catch (err) {
        console.log(err);
    }
};

module.exports.verifyTokens = (req, res, next) => {
    //token is in form 'Bearer Token'
    const access_token = req.headers['Authorization'].split(' ')[1];
    //check if it matches
    //next()
    //check if it's the last issued token
    //check if refresh token matches
    //issue new access and refresh token and add to res.locals
    //next()
    //next({refresh token doesn't match})
    //next(access token is expired)
};

module.exports.deleteTokens = (req, res, next) => {};

/*
    @method POST
    @url    /api/user
    @access public
*/
module.exports.login = async (req, res, next) => {
    console.log('Login Request :', req.body);
    const { phoneNo, password } = req.body;
    try {
        const result = await user.findOne({ phoneNo });
        if (result) {
            const passMatch = await bcrypt.compare(password, result.password);
            if (passMatch) {
                delete result.password;
                res.locals = result;
                next();
            } else {
                return res.status(400).json({ sucess: false, message: 'Password do not match' });
            }
        } else {
            res.locals = req.query;
            next();
            // res.status(400).json({ sucess: false, message: "user doesn't exists" });
        }
    } catch (err) {
        console.log(err);
        // next({ status: 400, message: err.message, stack: err.stack });
    }
};
