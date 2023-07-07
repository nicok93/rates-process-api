function notEmpty(string) {
    return string != null && string != "";
}

function addSafe(string) {
    if (string == "") { return null } else { return string };
}

export default { notEmpty, addSafe }