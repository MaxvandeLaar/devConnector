const validator = require('validator');
const path = require('path');
const isEmpty = require(path.resolve('validation/is-empty'));
module.exports = function validateProfileInput(data){
    let errors = {};

    const urls = ["website", "twitter", "facebook", "linkedIn", "instagram"];
    urls.forEach(field => {
        if (!isEmpty(data[field])){
            if (!validator.isURL(data[field])){
                errors[field] = 'Not a valid URL';
            }
        }
    });


    const dataFields = ["handle", "status", "skills"];
    dataFields.forEach(field => {
        data[field] = !isEmpty(data[field]) ? data[field] : "";
        if (validator.isEmpty(data[field])) {
            const fieldCap = field.substring(0, 1).toUpperCase() + field.substring(1);
            errors[field] = `${fieldCap} field is required`;
        } else {
            if (field === 'handle'){
                if (!validator.isLength(data[field], {min: 2, max:40})){
                    errors[field] = "Handle needs to be between 2 and 40 characters";
                }
            }
        }
    });

    return {
        errors: errors,
        isValid: isEmpty(errors)
    }
};
