import common from "../services/common.js";

const list = async (req, res, next) => {
    const body = req.body;
    const result = await common.pack(body.items);
    res.json(result);
    res.status(200);
}

export default { list }