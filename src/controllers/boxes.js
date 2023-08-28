import common from "../services/common.js";
import rates from "../services/rates.js"
const list = async (req, res, next) => {
    const body = req.body;
    let packedItems = await common.pack(body.items);
    packedItems = await rates.rate(body, packedItems, req.query);
    res.json(packedItems);
    res.status(200);
}

export default { list }