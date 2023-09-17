import shipstationModule from 'shipstation-system-api';
const getOrder = async (req, res, next) => {
    let orders = [];
    const orderID = req.params.id;
    const force = req.query.force;
    orders = await shipstationModule.ordersService.list({ force: force, orderID: orderID });
    res.json(orders);
    res.status(200);
}

export default { getOrder }