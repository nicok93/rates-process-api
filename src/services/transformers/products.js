function transformList(products) {
    let productsResponse = [];
    products.forEach(product => productsResponse.push(transform(product)));
    return productsResponse;
}
function transform(product, variantLength = 1, variantWidth = 1, variantHeight = 1) {
    return {
        id: product.id,
        sku: product.sku,
        weight: product.weight,
        length: product.length / variantLength,
        width: product.width / variantWidth,
        height: product.height * variantHeight,
        foldable: product.foldable,
        boxesOnly: product.boxesOnly
    };
}

export default { transformList, transform }