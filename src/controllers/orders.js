import shipstationModule from 'shipstation-system-api';
const getOrder = async (req, res, next) => {
    const orderID = req.params.id;
    const force = req.query.force;
    let result = { json: {} };
    try {
        result = { status: 200, json: await shipstationModule.ordersService.list({ force: force, orderID: orderID }) };
        if(!result.json){
            throw "Order does not exist with that ID";
        }
    } catch (error) {
        console.log(error);
        result = { status: 500, json: { error } }
    }
    res.status(result.status);
    res.json(result.json);
}

export default { getOrder }