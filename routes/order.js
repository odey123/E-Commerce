const Order = require('../models/order');
const express = require('express');
const OrderItem = require('../models/order-item');
const User = require('../models/user');
const router = express.Router();
const Product = require('../models/product')
const mongoose = require('mongoose')

router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered':-1});

    if(!orderList) {
        res.status(500).json({success: false})
    }
    res.send(orderList);
})


router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({ 
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'}})

    if(!order) {
        res.status(500).json({success: false, message: 'Order not found'})
    }
    res.send(order);
})

router.post('/', async (req, res)=>{

    // Validate User ID
    if (!mongoose.isValidObjectId(req.body.user)){
        return res.status(400).json({ success: false, message: 'Invalid User ID!'});
    }

    const user = await User.findById(req.body.user);
    if(!user) {
        return res.status(404).json({ success: false, message: 'User not found'})
    }


// Validate product IDs inside orderItems   

    const orderItemsIds = await Promise.all(
        req.body.orderItems.map(async (orderItem) => {
            if (!mongoose.isValidObjectId(orderItem.product)) {
                return res.status(400).json({success: false, message: 'Invalid Product ID!'})
            }

            const product = await Product.findById(orderItem.product);
            if(!product) {
                return res.status(404).json({ success: false, message: `Product with ID ${orderItem.product} not found!`})
            }
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product
            });

            newOrderItem = await newOrderItem.save();
            return newOrderItem._id;
        })
    );

  const totalPrices = await Promise.all(
  orderItemsIds.map(async (orderItemId) => {
  const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price'); // Populate product and get its price field
    
    if (!orderItem) {
      throw new Error(`OrderItem with ID ${orderItemId} not found`);
    }
    
    const orderItemTotal = orderItem.product.price * orderItem.quantity; // Calculate total for the order item
    return orderItemTotal;
  })
);

// Calculate total price
const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order ({
       orderItems: orderItemsIds,
       shippingAddress1: req.body.shippingAddress1,
       shippingAddress2: req.body.shippingAddress2,
       city: req.body.city,
       zip: req.body.zip,
       country: req.body.country,
       status: req.body.status,
       totalPrice: totalPrice, 
       user: req.body.user,
    })
    order = await order.save();

    if(!order) {
    return res.status(404).json({
        success: false, 
        message:'This order cannot be created! ',
      });
    }
    res.status(200).json({
        success:true, 
        message: 'order succesfully created',
        data: order,
    });

})

router.put('/:id', async(req, res)=> {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
        status: req.body.status
        },
        { new: true}
    )
    
    if(!order) {
    return res.status(400).json({success: false, message: 'This order cannot be updated'})
    }
    return res.status(201).json({success:true, message:"order successfully updated"})

})

router.delete('/:id', async (req, res) => {
    const order = await Order.findByIdAndDelete(req.params.id);
  
    if (order) {
      await Promise.all(
        order.orderItems.map(orderItem => OrderItem.findByIdAndDelete(orderItem))
      );
  
      return res.status(200).json({ success: true, message: 'The order and associated order items are deleted!' });
    } else {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
  });

  router.get('/get/totalsales', async (req, res)=> {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: {$sum: 'totalPrice'}}}
    ])

    if(!totalSales){
        return res.status(404).send('The total sales cannot be generated')
    }

    res.send({totalsales: totalSales})
  })
  
 



module.exports = router;