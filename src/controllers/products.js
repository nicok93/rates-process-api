import common from '../services/common.js';

const getProducts = async (req, res, next) => {
    const skus = [];
    req.query.sku.split(',').forEach(sku => {
        skus.push({ sku: sku });
    });
    let result = { json: {} };
    try {
        const products = await common.fetchProducts(skus);
        result = { status: 200, json: products };
        if (!result.json) {
            throw "Store does not exist with that ID";
        }
    } catch (error) {
        console.log(error);
        result = { status: 500, json: { error } }
    }
    res.status(result.status);
    res.json(result.json);
}

export default { getProducts }