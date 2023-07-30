import BinPacking3D from 'binpackingjs';
const { Item, Bin, Packer } = BinPacking3D.BP3D;
import sqlModule from 'sql-system-api';
import alternatives from '../utils/alternatives.js';

async function pack(items) {
    const boxes = await sqlModule.packagesService.list();
    let mapOfProducts = await fetchProducts(items);
    let packages = initPackagesMap();
    boxes.forEach(box => {
        packForAlternative(box, mapOfProducts, packages, alternatives.REGULAR);
        packForAlternative(box, mapOfProducts, packages, alternatives.FOLDABLE_HALF_LENGTH);
        packForAlternative(box, mapOfProducts, packages, alternatives.FOLDABLE_HALF_WIDTH);
    });
    const regular = buildResultByAlternative(packages, mapOfProducts, alternatives.REGULAR);
    const foldableByWidth = buildResultByAlternative(packages, mapOfProducts, alternatives.FOLDABLE_HALF_WIDTH);
    const foldableByLength = buildResultByAlternative(packages, mapOfProducts, alternatives.FOLDABLE_HALF_LENGTH);
    return Object.assign(regular, foldableByLength, foldableByWidth);
}

function initPackagesMap() {
    let packages = new Map();
    packages.set(alternatives.REGULAR, []);
    packages.set(alternatives.FOLDABLE_HALF_LENGTH, []);
    packages.set(alternatives.FOLDABLE_HALF_WIDTH, []);
    return packages;
}

function packForAlternative(box, mapOfProducts, packages, alternative) {
    let packer = new Packer();
    const interiorSizes = box.interior;
    const bin = new Bin(box.name, interiorSizes.width, interiorSizes.height, interiorSizes.length, box.maximumWeight)
    packer.addBin(bin);
    addProductsToPacker(mapOfProducts.get(alternative), packer);
    packer.pack();
    processPackaging(packages, alternative, packer);
}

function buildResultByAlternative(packages, mapOfProducts, alternative) {
    return {
        [alternative]: { packages: packages.get(alternative), items: mapOfProducts.get(alternative) }
    };
}

function processPackaging(packages, alternative, packer) {
    const boxesInMap = packages.get(alternative);
    for (const bin of packer.bins) {
        if (packer.unfitItems.length == 0) {
            boxesInMap.push(createBin(bin))
        }
    }
    packages.set(alternative, boxesInMap);
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
    products.forEach(product => {
        const item = new Item(product.id, product.width, product.height, product.length, product.weight);
        packer.addItem(item);
    });
}

async function fetchProducts(items) {
    let products = [];
    let mapOfProducts = new Map();
    for (const item of items) {
        const product = await sqlModule.productsService.list({ column: "shopify_sku", value: item.sku });
        for (let i = 0; i < item.quantity; i++) {
            products.push(transformProduct(product));
        }
    }
    mapOfProducts.set(alternatives.REGULAR, products);
    let foldableProducts = products.filter(product => product.foldable);
    if (foldableProducts != null && foldableProducts.length > 0) {
        let notFoldableProducts = products.filter(product => !product.foldable);
        let halfWidthProducts = [];
        let halfLengthProducts = [];
        foldableProducts.forEach(product => {
            const halfWidthProduct = transformProductByWidth(product)
            const halfLengthProduct = transformProductByLength(product)
            halfWidthProducts.push(halfWidthProduct);
            halfLengthProducts.push(halfLengthProduct);
        });
        halfWidthProducts.push(...notFoldableProducts);
        halfLengthProducts.push(...notFoldableProducts);
        mapOfProducts.set(alternatives.FOLDABLE_HALF_LENGTH, halfLengthProducts);
        mapOfProducts.set(alternatives.FOLDABLE_HALF_WIDTH, halfWidthProducts);
    }
    return mapOfProducts;
}

export default { pack }

function transformProduct(product) {
    let sku = product.sku;
    let weight = product.weight
    if (product.shopify != undefined) {
        const shopify = product.shopify;
        sku = shopify.sku;
        weight = shopify.weight;
    }
    return {
        id: product.id,
        sku: sku,
        weight: weight,
        length: product.length,
        width: product.width,
        height: product.height,
        foldable: product.foldable
    };
}

function transformProductByWidth(product) {
    product.length = product.length;
    product.width = product.width / 2;
    product.height = product.height * 2;
    return transformProduct(product);
}
function transformProductByLength(product) {
    product.length = product.length / 2;
    product.width = product.width;
    product.height = product.height * 2;
    return transformProduct(product);
}