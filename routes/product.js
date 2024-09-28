const Category = require('../models/category');
const Product = require('../models/product');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')

router.get(`/`,  async (req, res) => {
    const productlist = await Product.find();
    
    if(!productlist) {
        res.status(500).send("productlist not found")
    }
        res.status(200).json({status:true, data:productlist})
   
});

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');
    
    if(!product) {
        res.status(400).send("Product not found")
    }
        res.status(200).send(product)
});  

router.get(`/get/count`, async (req, res) => {
   try {
      const productCount = await Product.countDocuments()

      res.status(200).json({success: true, count: productCount});
   } catch (error) {
     console.log(error);
     res.status(500).json({ success: false, message: 'An error occurred while retrieving the product count' })
   }  
});  

router.post(`/`, async(req, res) => {
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });
    
    product = await product.save();

    if(!product) {
    return res.status(500).send('The product cannot be created')
    }
    res.send(product)
});

router.put('/', async(req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)) {
        res.status(401).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')
    
    const product = await Product.findByIdandUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured   
        },
        {new: true}
    )
    
    if(!product) {
        return res.status(400).json({success: false, message: 'This product cannot be updated'})
        }
        return res.status(201).json({success:true, message:"product successfully updated"})
    
    })

router.delete('/:id', (req, res) => {
        Product.findByIdAndDelete(req.params.id).then(product => {
         if(product) {
             return res.status(200).json({success: true,  message: 'the product is deleted!' })
         } else {
             return res.status(404).json({success: false, message:'product not found'})
         }
       }).catch(err=>{
         return res.status(400).json({success: false, error: err})
       })
     })  
     
router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({isFeatured: true}).limit(+count)

    if(!products){
        res.status(500).json({success: false}).l
    }
    res.send(products);
})




module.exports = router;