import connector from '../sql/connector.js';
import productTransformer from '../transformers/product.js';
import packageTransformer from '../transformers/packaging.js';
const transformers = {
    "products": productTransformer,
    "packagings": packageTransformer
};

async function list(entity, params) {
    let response = {};
    try {
        const dbResult = await connector.retrieve(entity, params);
        let result = transform(params, entity, dbResult);
        response = { status: 200, result: result };
    } catch (error) {
        console.log(error);
        response = { status: 500, result: error };
    }
    return response;
}

function transform(params, entity, dbResult) {
    let result = {};
    if (params == null) {
        result = transformers[entity].transformList(dbResult);
    } else {
        result = transformers[entity].transform(dbResult[0]);
    }
    return result;
}

export default { list }