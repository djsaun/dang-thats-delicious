const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers'); // Object destructuring -- allows us to import an entire object

// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore)); // Immediately runs catchErrors on post submit -- pushes errors in later middleware. Lets us avoid handling errors in the async/await function itself.
router.post('/add/:id', catchErrors(storeController.updateStore)); // Necessary for form action. Cannot actually navigate to /add/:id
router.get('/stores/:id/edit', catchErrors(storeController.editStore));

module.exports = router;
