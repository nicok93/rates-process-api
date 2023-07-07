import dotenv from 'dotenv';
import path from 'path';
const environmentPath = path.resolve('src/environments');
const environment = process.argv[2];
dotenv.config({ path: environmentPath + "/" + environment + '/.env' });
const properties = process.env
export { properties, environment }