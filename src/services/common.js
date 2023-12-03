import BinPacking3D from 'binpackingjs';
const { Item, Bin, Packer } = BinPacking3D.BP3D;
import sqlModule from 'sql-system-api';
import alternatives from '../utils/alternatives.js';
import ProductTransformer from './transformers/products.js';

async function pack(items) {
    const boxes = await sqlModule.packagesService.list();
    const products = await fetchProducts(items);
    let mapOfProducts = new Map();
    mapOfProducts.set(alternatives.REGULAR, products);
    processFoldableProducts(products, mapOfProducts);
    let packages = initPackagesMap();
    boxes.forEach(box => {
        packForAlternative(box, mapOfProducts, packages, alternatives.REGULAR);
        packForAlternative(box, mapOfProducts, packages, alternatives.FOLDABLE_HALF_LENGTH);
        packForAlternative(box, mapOfProducts, packages, alternatives.FOLDABLE_HALF_WIDTH);
    });
    let fullPackages = packages.get(alternatives.REGULAR).concat(packages.get(alternatives.FOLDABLE_HALF_WIDTH)).concat(packages.get(alternatives.FOLDABLE_HALF_LENGTH));
    fullPackages = fullPackages.sort(function (box1, box2) { return box1.cubic - box2.cubic });
    return { packages: fullPackages, items: mapOfProducts.get(alternatives.REGULAR) };
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
    // console.log(box);
    const bin = new Bin(box.name, interiorSizes.width, interiorSizes.height, interiorSizes.length, box.maximumWeight)
    const products = mapOfProducts.get(alternative) ?? [];
    const hasBoxesOnlyProduct = products.filter(product => product.boxesOnly).length;
    if (!hasBoxesOnlyProduct || (hasBoxesOnlyProduct > 0 && box.type == "Box")) {
        packer.addBin(bin);
    }
    addProductsToPacker(products, packer);
    packer.pack();
    processPackaging(packages, alternative, box, packer);
}

function processPackaging(packages, alternative, box, packer) {
    let boxesInMap = packages.get(alternative);
    for (const bin of packer.bins) {
        if (packer.unfitItems.length == 0) {
            let newBox = createBin(box, alternative);
            boxesInMap.push(newBox);
        }
    }
    packages.set(alternative, boxesInMap);
}

function createBin(box, alternative) {
    const interiorSizes = box.interior;
    const cubic = interiorSizes.width * interiorSizes.height * interiorSizes.length;
    let price = 0;
    if (box.suppliers.length > 0) {
        price = box.suppliers[0].price
    }
    const response = {
        id: box.packageID + alternative + cubic,
        name: box.name,
        width: interiorSizes.width,
        height: interiorSizes.height,
        length: interiorSizes.length,
        maxWeight: box.maximumWeight,
        cubic: cubic,
        type: box.type,
        boxPrice: price,
        tapeCost: box.tapeCost ?? 0,
        foldingStorageForTheItems: alternative
    };
    return response;
}

function addProductsToPacker(products, packer) {
    products.forEach(product => {
        let allowedRotations = [0, 1, 2, 3, 4, 5];
        if (product.keepVertical) {
            allowedRotations = [1, 2]
        }
        const item = new Item(product.id, product.width, product.height, product.length, product.weight, allowedRotations);
        packer.addItem(item);
    });
}

async function fetchProducts(items) {
    let products = [];
    let filters = prepareFilters(items);
    const dbProducts = await sqlModule.productsService.list(filters);
    if (dbProducts.length == 0) {
        throw "Items not found / No items in order"
    }
    dbProducts.forEach(product => {
        const quantity = items.filter(item => product.sku == item.sku)[0].quantity ?? 1;
        for (let i = 0; i < quantity; i++) {
            products.push(ProductTransformer.transform(product));
        }
    })
    return products;
}

function prepareFilters(items) {
    let filters = [];
    for (const item of items) {
        filters.push({ key: "shopify_sku", value: item.sku });
    }
    return filters;
}

function processFoldableProducts(products, mapOfProducts) {
    let foldableProducts = products.filter(product => product.foldable);
    if (foldableProducts != null && foldableProducts.length > 0) {
        let notFoldableProducts = products.filter(product => !product.foldable);
        let halfWidthProducts = [];
        let halfLengthProducts = [];
        foldableProducts.forEach(product => {
            const halfWidthProduct = ProductTransformer.transform(product, 1, 2, 2);
            const halfLengthProduct = ProductTransformer.transform(product, 2, 1, 2);
            halfWidthProducts.push(halfWidthProduct);
            halfLengthProducts.push(halfLengthProduct);
        });
        halfWidthProducts.push(...notFoldableProducts);
        halfLengthProducts.push(...notFoldableProducts);
        mapOfProducts.set(alternatives.FOLDABLE_HALF_LENGTH, halfLengthProducts);
        mapOfProducts.set(alternatives.FOLDABLE_HALF_WIDTH, halfWidthProducts);
    }
}

export default { pack, fetchProducts }