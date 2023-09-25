import shipstationModule from 'shipstation-system-api';
const getWarehouse = async (req, res, next) => {
    const warehouseID = req.params.id;
    const force = req.query.force;
    let result = { json: {} };
    try {
        result = { status: 200, json: await shipstationModule.warehousesService.list({ force: force, warehouseID: warehouseID }) };
        if (!result.json) {
            throw "Warehouse does not exist with that ID";
        }
    } catch (error) {
        console.log(error);
        result = { status: 500, json: { error } }
    }
    res.status(result.status);
    res.json(result.json);
}

export default { getWarehouse }