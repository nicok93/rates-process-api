import express from 'express';
import boxesController from '../controllers/boxes.js'
import ordersController from '../controllers/orders.js';
import storesController from '../controllers/stores.js';
import warehousesController from '../controllers/warehouses.js';
import productsController from '../controllers/products.js';
import labelController from '../controllers/label.js';

const routes = express.Router();

routes.post('/v1/boxes', boxesController.list);

routes.post('/v1/rates', boxesController.list);

routes.get('/v1/orders/:id', ordersController.getOrder);

routes.get('/v1/stores/:id', storesController.getStore);

routes.get('/v1/warehouses/:id', warehousesController.getWarehouse);

routes.get('/v1/products', productsController.getProducts);

routes.post('/v1/label', labelController.label);

export { routes }