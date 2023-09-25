import shipstationModule from 'shipstation-system-api';
const getStore = async (req, res, next) => {
    const storeID = req.params.id;
    const force = req.query.force;
    let result = { json: {} };
    try {
        result = { status: 200, json: await shipstationModule.storesService.list({ force: force, storeID: storeID }) };
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

export default { getStore }