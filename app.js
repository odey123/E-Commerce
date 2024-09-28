const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authjwt = require('./middleware/jwt')

app.use(cors());
app.options('*', cors())
const api = process.env.API_URL;

//Routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/product');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/order');
const { handleAuthErrors } = require('./middleware/Errorhandler');


//middle ware
app.use(bodyParser.json());
app.use(morgan('tiny'));    
app.use(authjwt());
app.use(handleAuthErrors)
//Routers
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);


const connectionString = process.env.CONNECTION_STRING;

mongoose.connect('mongodb+srv://eshop:12345678a@eshop-database.tck4n.mongodb.net/eshop-database?retryWrites=true&w=majority')
  .then(() => console.log('Database connection is ready...'))
  .catch((err) => console.error('Database connection error:', err));


app.listen(7002, ()=>{
       console.log('The server is running on on http://localhost:7002')
});

