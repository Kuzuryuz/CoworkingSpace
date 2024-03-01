const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

//const swaggerJsDoc = require('swagger-jsdoc');
//const swaggerUi = require('swagger-ui-express');

const coworkingspaces = require('./routes/coworkingspaces');
const auth = require('./routes/auth');
const reservations = require('./routes/reservations');

// Load env vars
dotenv.config({path: './config/config.env'});

connectDB();

const app = express();

//Body parser
app.use(express.json());

//sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 mins
    max: 500
});
app.use(limiter);

//Prevent http param pollution
app.use(hpp());

//Enable CORS
app.use(cors());

/*
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express VacQ API'
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1'
            }
        ],
    },
    apis: ['./routes/*.js']
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
*/

app.use('/api/v1/coworkingspaces', coworkingspaces);
app.use('/api/v1/auth', auth);
app.use('/api/v1/reservations', reservations);

//Cookie parser
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in', process.env.NODE_ENV, 'mode on port', PORT));
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});