import express from 'express';
import boxesController from '../controllers/boxes.js'
import ordersController from '../controllers/orders.js';
const routes = express.Router();

routes.post('/v1/boxes', boxesController.list);

routes.post('/v1/rates', boxesController.list);

routes.get('/v1/orders/:id', ordersController.getOrder);

export { routes }