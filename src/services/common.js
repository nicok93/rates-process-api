import BinPacking3D from 'binpackingjs';
const { Item, Bin, Packer } = BinPacking3D.BP3D;
import sqlModule from 'sql-system-api';

async function pack(items) {
    const boxes = await sqlModule.packagesService.list();
    let products = await fetchProducts(items);
    let packages = [];
    let result = {};
    let responseItems = []
    boxes.forEach(box => {
        const interiorSizes = box.interior;
        let packer = new Packer();
        const bin = new Bin(box.name, interiorSizes.width, interiorSizes.height, interiorSizes.length, box.maximumWeight)
        packer.addBin(bin);
        responseItems = addProductsToPacker(products, packer);
        packer.pack();
        for (const bin of packer.bins) {
            if (packer.unfitItems.length == 0) {
                packages.push(createBin(bin));
            }
        }
    });
    result = { packages: packages, items: responseItems };
    return result;
}

function createBin(bin) {
    return {
        name: bin.name,
        width: bin.width / 100000,
        height: bin.height / 100000,
        depth: bin.depth / 100000,
        maxWeight: bin.maxWeight / 100000,
    };
}

function addProductsToPacker(products, packer) {
    let responseProducts = [];
    products.forEach(product => {
        // if(foldable){
        //     length = interiorSizes.length / 2;
        //     height = interiorSizes.length * 2;
        // }
        const item = new Item(product.id, product.width, product.height, product.length, product.shopify.weight);
        responseProducts.push(createItem(item));
        packer.addItem(item);
    });
    return responseProducts;
}

function createItem(item) {
    return {
        name: item.name,
        width: item.width / 100000,
        height: item.height / 100000,
        depth: item.depth / 100000,
        weight: item.weight / 100000,
    };
}

async function fetchProducts(items) {
    let products = [];
    for (const item of items) {
        products.push(await sqlModule.productsService.list({ column: "shopify_sku", value: item.sku }));
    }
    return products;
}

export default { pack }