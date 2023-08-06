import BinPacking3D from 'binpackingjs';
const { Item, Bin, Packer } = BinPacking3D.BP3D;
import sqlModule from 'sql-system-api';
import alternatives from '../utils/alternatives.js';
import ProductTransformer from './transformers/products.js';

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
    const products = mapOfProducts.get(alternative);
    const hasBoxesOnlyProduct = products.filter(product => product.boxesOnly).length;
    if (!hasBoxesOnlyProduct || (hasBoxesOnlyProduct > 0 && box.type == "Box")) {
        packer.addBin(bin);
    }
    addProductsToPacker(products, packer);
    packer.pack();
    processPackaging(packages, alternative, box, packer);
}

function buildResultByAlternative(packages, mapOfProducts, alternative) {
    return {
        [alternative]: { packages: packages.get(alternative), items: mapOfProducts.get(alternative) }
    };
}

function processPackaging(packages, alternative, box, packer) {
    const boxesInMap = packages.get(alternative);
    for (const bin of packer.bins) {
        if (packer.unfitItems.length == 0) {
            boxesInMap.push(createBin(box))
        }
    }
    packages.set(alternative, boxesInMap);
}

function createBin(bin) {
    const interiorSizes = bin.interior
    const response = {
        name: bin.name,
        width: interiorSizes.width,
        height: interiorSizes.height,
        length: interiorSizes.length,
        maxWeight: bin.maximumWeight,
        type: bin.type
    };
    return response;
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
    let filters = [];
    for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
            filters.push({ key: "shopify_sku", value: item.sku });
        }
    }
    const dbProducts = await sqlModule.productsService.list(filters);
    products = ProductTransformer.transformList(dbProducts);
    mapOfProducts.set(alternatives.REGULAR, products);
    processFoldableProducts(products, mapOfProducts);
    return mapOfProducts;
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

export default { pack }