const lowerCaseRegex = /[A-Z]/g;
const upperCaseRegex = /[a-z]/g;
const digitsRegex = /[0-9]/g;
const specialCharsRegex = /[!@#$%&*]/g;
function isPasswordCompliant(password, minLength = 8) {
    if (password == null || password.isEmpty) {
        return false;
    }
    const hasUppercase = !!password.match(upperCaseRegex);
    const hasLowercase = !!password.match(lowerCaseRegex);
    const hasDigits = !!password.match(digitsRegex);
    const hasSpecialCharacters = !!password.match(specialCharsRegex);
    const hasMinLength = password.length >= minLength;

    return hasDigits & hasUppercase & hasLowercase & hasSpecialCharacters & hasMinLength;
}

module.exports = {
    isPasswordCompliant
};
