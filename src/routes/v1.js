import express from 'express';
import boxesController from '../controllers/boxes.js'
const routes = express.Router();

routes.post('/v1/boxes', boxesController.list);

routes.post('/v1/rates', boxesController.list);

export { routes }