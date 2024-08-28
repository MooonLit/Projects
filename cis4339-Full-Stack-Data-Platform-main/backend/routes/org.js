const express = require('express');
const router = express.Router();
require('dotenv').config();
const {orgs} = require('../models/models');

router.get('/:id', async (req, res) => {
    try {
        const org = await orgs.findById(req.params.id);
        if (!org) {
            res.status(404).json({message: 'Organization not found'});
        } else {
            res.json({name: org.name});
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({message: 'Server error'});
    }
});
module.exports = router;

