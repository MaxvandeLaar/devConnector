const validator = require('validator');
const path = require('path');
const isEmpty = require(path.resolve('validation/is-empty'));
module.exports = function validateLoginInput(data){
    let errors = {};

    if (!validator.isEmail(data.email)){
        errors.email = "Email not valid";
    }

    const dataFields = ["email", "password"];
    dataFields.forEach(field => {
        data[field] = !isEmpty(data[field]) ? data[field] : "";
        if (validator.isEmpty(data[field])) {
            const fieldCap = field.substring(0, 1).toUpperCase() + field.substring(1);
            errors[field] = `${fieldCap} field is required`;
        }
    });

    return {
        errors: errors,
        isValid: isEmpty(errors)
    }
};
