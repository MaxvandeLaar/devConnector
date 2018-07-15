const validator = require('validator');
const path = require('path');
const isEmpty = require(path.resolve('validation/is-empty'));
module.exports = function validateRegisterInput(data){
    let errors = {};

    if (!validator.isLength(data.name, {min: 2, max: 30})){
        errors.name = "Name must be between 2 and 30 characters";
    }

    if (!validator.isLength(data.password, {min: 6, max: 30})){
        errors.password = "Password must be between 6 and 30 characters";
    }

    if (!validator.equals(data.password, data.password2)){
        errors.password2 = "Passwords must match";
    }

    if (!validator.isEmail(data.email)){
        errors.email = "Email not valid";
    }

    const dataFields = ["name", "email", "password", "password2"];
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
