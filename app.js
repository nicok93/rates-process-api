import express from 'express';
import { routes } from './src/routes/v1.js';
const app = express();
import { properties } from './src/environments/properties.js';
import shipstationSystemAPI from 'shipstation-system-api';
import sqlSystemAPI from 'sql-system-api';
import easypostSystemAPI from 'easypost-system-api';
// const response = await easypostSystemAPI.addressService.retrieve();
// response.addresses.forEach(address => {
//     console.log(address.id);
// });
// console.log(await shipstationSystemAPI.storesService.list({ queryParams: { force: false } }));
// console.log(await sqlSystemAPI.productsService.list());
import common from './src/services/common.js';
await common.packer();
// console.log(JSON.stringify(await shipstationSystemAPI.ordersService.list()));
app.get('/', (req, res) => res.send('App is working'));
app.use('/api', routes)

app.listen(process.env.PORT, () => console.log('Rates process API listening on port ' + properties.PORT + '!'))