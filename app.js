import express from 'express';
import { routes } from './src/routes/v1.js';
const app = express();
app.use(express.json())
import { properties } from './src/environments/properties.js';
app.get('/', (req, res) => res.send('App is working'));
app.use('/api', routes)

app.listen(process.env.PORT, () => console.log('Rates process API listening on port ' + properties.PORT + '!'))