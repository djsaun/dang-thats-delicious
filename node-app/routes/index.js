const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers'); // Object destructuring -- allows us to import an entire object

// Do work here
router.get('/', storeController.homePage);
router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore)); // Immediately runs catchErrors on post submit -- pushes errors in later middleware. Lets us avoid handling errors in the async/await function itself.

module.exports = router;
