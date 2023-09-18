import easypostModule from "easypost-system-api";
import sqlModule from 'sql-system-api';
import addressService from './address.js';
import shipstationModule from "shipstation-system-api";

async function rate(shippingDetails, packedItems, queryParams) {
    const weight = calculateTotalWeight(packedItems);
    const addressFrom = await shipstationModule.warehousesService.list({ warehouseID: shippingDetails.warehouseID });
    const addressTo = await addressService.validate(shippingDetails.shipTo);
    if (addressTo.isValid) {
        const zone = addressTo.result.state;
        const requestedShippingService = shippingDetails.requestedShippingService ?? "Super Saver";
        const mapping = (await sqlModule.zoneService.listMapping(zone, requestedShippingService));
        let easypostCodes = await loadEasypostCodes(mapping);
        const appraisedBoxes = calculateBoxesToRate(queryParams, packedItems.packages.length);
        for (const box of packedItems.packages) {
            if (appraisedBoxes.includes(packedItems.packages.indexOf(box) + 1)) {
                const shipmentParameters = createShipment(addressFrom.originAddress, addressTo, box, weight);
                const shipment = await easypostModule.shipmentService.create(shipmentParameters);
                shipment.rates = shipment.rates.filter(rate => easypostCodes.includes(rate.service));
                box.rates = shipment.rates;
            }
        };
    }
    return packedItems;
}

function createShipment(addressFrom, addressTo, box, weight) {
    return {
        fromAddress: addressFrom,
        toAddress: { id: addressTo.id },
        parcel: createParcel(box, weight)
    };
}

function createParcel(box, weight) {
    return {
        length: box.length,
        width: box.width,
        height: box.height,
        weight: weight,
    };
}

async function loadEasypostCodes(mapping) {
    let easypostCodes = [];
    mapping.forEach(service => {
        if (service.easypostServiceCodes != null && service.easypostServiceCodes != '') {
            easypostCodes.push(service.easypostServiceCodes);
        }
    });
    return easypostCodes;
}

function calculateBoxesToRate(rateRange, maxPackageLength) {
    const appraisedBoxes = [];
    for (let i = rateRange.firstAppraised ?? 1; i <= (rateRange.lastAppraised ?? maxPackageLength); i++) {
        appraisedBoxes.push(Number(i));
    }
    return appraisedBoxes;
}

function calculateTotalWeight(packedItems) {
    let weight = 0;
    packedItems.items.forEach(item => {
        weight += item.weight;
    });
    return weight;
}

export default { rate }