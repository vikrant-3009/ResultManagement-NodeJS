
exports.validateDob = (dob) => {
    const dob_new = new Date(dob);
    const currentDate = new Date();

    if(dob_new >= currentDate) {
        return false;
    }
    return true;
}   