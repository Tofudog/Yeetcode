const letters = "001122334455667778899abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numLetters = letters.length;

function generateRandomCode() {
    var code = "";
    for (var i=0; i<4; i++) {
        let idx = Math.floor(Math.random()*numLetters);
        code += letters.charAt(idx);
    }
    return code;
}

module.exports = generateRandomCode;