import express from 'express';
import { routes } from './src/routes/v1.js';
import { properties } from './src/environments/properties.js';
import shipstation from 'shipstation-system-api';
const app = express();
app.use(express.json())
app.get('/', (req, res) => res.send('App is working'));
app.use('/api', routes)
shipstation.schedulers.start();
app.listen(process.env.PORT, () => console.log('Rates process API listening on port ' + properties.PORT + '!'))