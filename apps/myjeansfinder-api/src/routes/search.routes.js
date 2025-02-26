const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware.verifyToken, searchController.searchJeans);

router.get('/:id', authMiddleware.verifyToken, searchController.getJeansById);

module.exports = router;
