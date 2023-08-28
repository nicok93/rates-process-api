import easypostModule from "easypost-system-api";

async function validate(address) {
    const result = transformAddress(address);
    const validatedAddress = await easypostModule.addressService.create(result);
    const id = validatedAddress.id;
    const isValid = validatedAddress.verifications.zip4.success;
    return { isValid, result, id };
}

function transformAddress(address) {
    return {
        "street1": address.street1,
        "street2": address.street2,
        "city": address.city,
        "state": address.state,
        "zip": address.postalCode,
        "country": address.country,
        "company": address.company,
        "phone": address.phone,
        "verify": true
    };
}

export default { validate }