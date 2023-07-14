import { Bin, Item, Packer } from 'bin-packing-3d';
import sqlSystemAPI from 'sql-system-api';

async function packer() {
    const boxes = await sqlSystemAPI.packagesService.list();
    const products = await sqlSystemAPI.productsService.list();
    let packer = new Packer();
    boxes.forEach(box => {
        const interiorSizes = box.interior;
        const bin = new Bin(box.name, interiorSizes.width, interiorSizes.height['1'], interiorSizes.length, box.maximumWeight)
        packer.add_bin(bin);
    });
    products.slice(145).forEach(product => {
        const item = new Item(product.id, product.width, product.height, product.length, product.shopify.weight)
        packer.add_item(item);
    });
    packer.pack();

    for (let i = 0; i < packer.bins.length; i++) {
        if (packer.bins[i].unfitted_items.length == 0) {
            console.log(":::::::::::", packer.bins[i].name);
        }
    }
}


export default { packer }


    // packer.add_bin(new Bin('small-envelope', 11.5, 6.125, 0.25, 10));
    // packer.add_bin(new Bin('large-envelope', 15.0, 12.0, 0.75, 15));
    // packer.add_bin(new Bin('small-box', 8.625, 5.375, 1.625, 70.0));
    // packer.add_bin(new Bin('medium-box', 11.0, 8.5, 5.5, 70.0));
    // packer.add_bin(new Bin('medium-2-box', 13.625, 11.875, 3.375, 70.0));
    // packer.add_bin(new Bin('large-box', 12.0, 12.0, 5.5, 70.0));
    // packer.add_bin(new Bin('testststs', 10.0, 10.0, 6.0, 70.0));
    // // packer.add_bin(new Bin('large-2-box', 23.6875, 11.75, 3.0, 70.0));

// {
//     packageID: 7,
//     id: '00007',
//     name: '15 x 20 x 4" (Gusseted Poly Mailer)"',
//     shortName: '15 x 20 x 4""',
//     type: 'Gusseted Poly Mailer',
//     suppliers: [ [Object] ],
//     tapeCost: '',
//     exterior: {
//       length: '20.000',
//       width: '15.000',
//       height: [Object],
//       cubic: [Object]
//     },
//     interior: {
//       length: '20.000',
//       width: '15.000',
//       height: [Object],
//       cubic: [Object]
//     },
//     padding: '0.0000',
//     maximumWeight: '10.0000',
//     emptyWeight: '0.0724'
//   }

// packer.add_item(new Item('50g [powder 1]', 3.9370, 1.9685, 1.9685, 1));
// packer.add_item(new Item('50g [powder 2]', 3.9370, 1.9685, 1.9685, 2));
// packer.add_item(new Item('50g [powder 3]', 3.9370, 1.9685, 1.9685, 3));
// packer.add_item(new Item('250g [powder 4]', 7.8740, 3.9370, 1.9685, 4));
// packer.add_item(new Item('250g [powder 5]', 7.8740, 3.9370, 1.9685, 5));
// packer.add_item(new Item('250g [powder 6]', 7.8740, 3.9370, 1.9685, 6));
// packer.add_item(new Item('250g [powder 7]', 7.8740, 3.9370, 1.9685, 7));
// packer.add_item(new Item('250g [powder 8]', 7.8740, 3.9370, 1.9685, 8));
// packer.add_item(new Item('250g [powder 9]', 7.8740, 3.9370, 1.9685, 9));