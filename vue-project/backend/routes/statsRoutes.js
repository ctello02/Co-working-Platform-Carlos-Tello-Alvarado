const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verify_tokens');
const stats = require('../controllers/statsController');

router.get('/rangeCharts', verifyToken, stats.getRangeCharts);
router.get('/oneShotCharts', verifyToken, stats.getOneShotCharts);
module.exports = router;
