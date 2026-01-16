const express = require('express');
const path = require('path');
//importing env variables
const dotenv = require('dotenv');
const rateLimiter = require('./middlewares/rateLimiter');
const cors = require('cors');

dotenv.config(); // { path: path.resolve(__dirname, 'config', 'config.env') }
const app = express();

var whitelist = ['http://192.168.43.201:3000', 'http://10.0.2.2:5000', 'http://localhost:3001', 'https://192.168.43.201:5173', 'http://localhost:5173'];

app.use(rateLimiter);
app.use(
    cors({
        origin: function (origin, callback) {
            if (whitelist.indexOf(origin) !== -1 || !origin) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        optionsSuccessStatus: 200
    })
);

//serving static files
app.use(express.static(path.join(__dirname, 'static')));

//for reading request.body
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//handling all rountes here
app.get("/", (req, res) => {
  res.send("Render Express app is live 🚀");
});

const routeHandler = require('./routes/routes');
app.use('/api', routeHandler);

//handling all errors from routes here
const errorHandler = require('./errorHandler/errorHandler.middleware');
app.use(errorHandler);

//connecting to db
const connectDB = require('./connectDB/connectDb');
connectDB('chatApp');

//setting up http server
var server;
if (process.env.mode === 'production') {
    const http = require('http');
    server = http.Server(app);
} else {
    const fs = require('fs');
    const options = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    };
    server = require('https').Server(options, app);
}

//init socket.io
const io = require('socket.io')(8100, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST']
    }
});

const socketHandler = require('./socketHandler/socketHandler');
socketHandler(io);

//setting up peerServer
var ExpressPeerServer = require('peer').ExpressPeerServer;
var options = {
    debug: true
};
app.use('/peerjs', ExpressPeerServer(server, options));

//strarting server
server.listen(process.env.PORT || 5000, () => {
    console.log(`server listeneing on port ${process.env.PORT} in ${process.env.MODE} mode`);
});

//close server on unhandeled rejections
process.on('unhandeledRejection', (err, promise) => {
    console.log(err.message);
    server.close(() => {
        process.exit('terminating the process');
    });
});
