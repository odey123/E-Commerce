const Category = require('../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const CategoryList = await Category.find();

    if(!CategoryList) {
        res.status(500).json({success: false, message:"category not found"})
    }
    res.status(200).json({success: true, data:CategoryList})
})


router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(500).json({message: 'The category with the given ID was not found.'})
    }
    res.status(200).json({message:true})
})


router.post('/', async (req, res)=>{
    let category = new Category ({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,

    })
    category = await category.save();

    if(!category) {
    return res.status(404).json({
        success: false, 
        message:'This category cannot be created! ',
      });
    }
    res.status(200).json({
        success:true, 
        message: 'category succesfully created',
        data: category,
    });

})


router.put('/:id', async(req, res)=> {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
        },
        { new: true}
    )
    
    if(!category) {
    return res.status(400).json({success: false, message: 'This category cannot be updated'})
    }
    return res.status(201).json({success:true, message:"category successfully updated"})

})


router.delete('/:id', (req, res) => {
   Category.findByIdAndDelete(req.params.id).then(category => {
    if(category) {
        return res.status(200).json({success: true,  message: 'the category is deleted!' })
    } else {
        return res.status(404).json({success: false, message:'category not found'})
    }
  }).catch(err=>{
    return res.status(400).json({success: false, error: err})
  })
})

module.exports = router;