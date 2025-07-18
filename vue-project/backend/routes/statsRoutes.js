const express = require('express');
const router = express.Router();
const stats = require('../controllers/statsController');

router.get('/rangeCharts', stats.getRangeCharts);
router.get('/oneShotCharts', stats.getOneShotCharts);
module.exports = router;
