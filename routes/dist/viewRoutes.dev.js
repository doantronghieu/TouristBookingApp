"use strict";

var express = require('express');

var viewsController = require('./../controllers/viewController');

var router = express.Router(); // FRONTEND ROUTES

router.get('/', viewsController.getOverview);
router.get('/tour', viewsController.getTour);
module.exports = router;