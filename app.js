const express = require('express');
const path = require('path');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv')
dotenv.config({ path: "config/config.env" })

const authorizationRouter = require('./routes/authorization');
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const bookingRouter = require('./routes/booking');
const serviceRouter = require('./routes/service');
const authenticationRouter = require('./routes/authentication');

const app = express();

mongoose.set('strictQuery', false);
const main = async () => {
  await mongoose.connect(`mongodb+srv://Vaibhav:aDv4zSoy9pwIYX8n@cluster0.ltqvern.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);
};
main().then(()=>{
  console.log("Success")
}).catch(err => console.log(err));

app.get('/item', (req, res) => {
  res.send("GET Request Called")
})
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(helmet());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('*', authorizationRouter)
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/booking', bookingRouter);
app.use('/service', serviceRouter);
app.use('/authentication', authenticationRouter);

app.use((req, res) => res.status(404).send('Route not found'));

module.exports = app;
