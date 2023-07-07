function validateRequiredAttribute(value, attributeName) {
    if (value == null || value == undefined) {
        const errorMessage = attributeName + " is a required field.";
        throw { message: errorMessage };
    }
}
export default { validateRequiredAttribute }