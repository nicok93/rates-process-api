import easypostModule from "easypost-system-api";
import sqlModule from 'sql-system-api';
import addressService from './address.js'
import Alternatives from "../utils/alternatives.js";
async function rate(shippingDetails, packedItems, queryParams) {
    const weight = calculateTotalWeight(packedItems);
    const addressFrom = await addressService.validate(shippingDetails.shipFrom);
    const addressTo = await addressService.validate(shippingDetails.shipTo);
    if (addressFrom.isValid && addressTo.isValid) {
        const zone = (await sqlModule.zoneService.list([{ key: "code", value: addressTo.result.state }]))[0].zone;
        const requestedShippingService = shippingDetails.requestedShippingService;
        const mapping = (await sqlModule.carrierMappingService.list([{ key: "zone", value: zone, filterType: "AND" }, { key: "shipping_option", value: requestedShippingService }]))[0];
        let easypostCodes = await loadEasypostCodes(mapping);
        let alternativesToRate = [Alternatives.REGULAR];
        if (queryParams.alternativeToRate != null) {
            alternativesToRate = queryParams.alternativeToRate.split(',');
        }
        if (alternativesToRate.includes(Alternatives.REGULAR)) {
            const packages = packedItems.regular;
            await rateForAlternative(queryParams, packages, addressFrom, addressTo, weight, easypostCodes);
        }
        if (alternativesToRate.includes(Alternatives.FOLDABLE_HALF_LENGTH)) {
            const packages = packedItems.foldedByLength;
            await rateForAlternative(queryParams, packages, addressFrom, addressTo, weight, easypostCodes);
        }
        if (alternativesToRate.includes(Alternatives.FOLDABLE_HALF_WIDTH)) {
            const packages = packedItems.foldedByWidth;
            await rateForAlternative(queryParams, packages, addressFrom, addressTo, weight, easypostCodes);
        }
    }
    return packedItems;
}

async function rateForAlternative(rateRange, alternative, addressFrom, addressTo, weight, easypostCodes) {
    const appraisedBoxes = calculateBoxesToRate(rateRange, alternative.packages.length);
    for (const box of alternative.packages) {
        if (appraisedBoxes.includes(alternative.packages.indexOf(box) + 1)) {
            const shipment = await easypostModule.shipmentService.create(createShipment(addressFrom, addressTo, box, weight));
            shipment.rates = shipment.rates.filter(rate => easypostCodes.includes(rate.service));
            box.rates = shipment.rates;
        }
    };
}

function createShipment(addressFrom, addressTo, box, weight) {
    return {
        fromAddress: { id: addressFrom.id },
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
    let servicesFilters = loadFilters(mapping);
    const services = (await sqlModule.carrierServicesService.list(servicesFilters));
    let easypostCodes = [];
    services.forEach(service => {
        if (service.easypostServiceCode != null && service.easypostServiceCode != '') {
            easypostCodes.push(service.easypostServiceCode);
        }
    });
    return easypostCodes;
}

function loadFilters(mapping) {
    let servicesFilters = [];
    mapping.services.forEach(async (service) => {
        servicesFilters.push({ key: "service", value: service });
    });
    return servicesFilters;
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
    packedItems.regular.items.forEach(item => {
        weight += item.weight;
    });
    return weight;
}

export default { rate }