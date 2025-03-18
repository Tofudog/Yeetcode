const letters = "001122334455667778899abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numLetters = letters.length;

const generateRandomCode = () => {
    let code = "";
    for (let i = 0; i < 4; i++) {
        let idx = Math.floor(Math.random() * numLetters);
        code += letters.charAt(idx);
    }
    return code;
};

export default generateRandomCode;
