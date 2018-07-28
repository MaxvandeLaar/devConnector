const validator = require('validator');
const path = require('path');
const isEmpty = require(path.resolve('validation/is-empty'));
module.exports = function validatePostInput(data){
    let errors = {};

    if (!validator.isLength(data.text, {min:10, max:300})){
        errors.text = 'Post must be between 10 and 300 characters';
    }

    const dataFields = ["text"];
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
