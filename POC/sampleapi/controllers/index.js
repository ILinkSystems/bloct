var express = require('express');
var router = express.Router();

router.use('/api/login', require('./login'))
router.use('/api/device', require('./device'))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BLOCT' });
});

module.exports = router;
