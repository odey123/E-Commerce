const User = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')


router.get(`/`, async (req, res) => {
    const userList = await User.find();

    if(!userList) {
        res.status(500).json({success: false})
    }
    res.send(userList);
})


router.get(`/:id`, async (req, res) => {
    const userList = await User.findById(req.params.id).select('-passwordHash');

    if(!userList) {
        res.status(404).json({message:'The user with the given ID was not found'})
    }
    res.json({success: true, data:userList});
})


router.post('/register', async (req, res) => {
    
        // Check if a user with the same email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // If no existing user, create a new user
        let user = new User({
            name: req.body.name,
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10), // Hash the password
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country
        });

        user = await user.save();

        if (!user)
            return res.status(500).json({ message: 'The user could not be created' });

        res.status(201).json({ message: 'User created successfully', user });
    
});


router.post('/login', async (req, res) => {
    const secret = process.env.secret;
    try {
        const user = await User.findOne({ email: req.body.email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if password is provided
        if (!req.body.password) {
            return res.status(200).json({ message: 'Password is required' });
        }

        // Compare the password
        const passwordMatch = bcrypt.compareSync(req.body.password, user.passwordHash);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign(  
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
             secret,
             {expiresIn : '1d'}
        )
        res.status(400).send({user: user.email, token})
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});


router.delete('/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id).then(user => {
     if(user) {
         return res.status(200).json({success: true,  message: 'The user is deleted!' })
     } else {
         return res.status(404).json({success: false, message:'user not found'})
     }
   }).catch(err=>{
     return res.status(400).json({success: false, error: err})
   })
 })  
 

 router.get('/get/count', async (req, res) => {
    try {
       const userCount = await User.countDocuments()
 
       res.status(200).json({success: true, message: userCount});
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'An error occurred while retrieving the User count' })
    }  
 });  
 
 

module.exports = router;