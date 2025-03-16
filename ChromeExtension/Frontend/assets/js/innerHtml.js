//TODO: add some unit tests

function innerHtmlStyle(text, className=null, stylingMap=null) {
    //styling is a js Map of html primitive attribute to its value
    if (className === null && (stylingMap === null || stylingMap.size === 0)) {
        return text;
    }
    if (className === null) {
        let styledText = `<span style="`;
        for (let [attribute, value] of stylingMap) {
            styledText += `${attribute}:${value};`;
        }
        styledText = styledText.slice(0, -1); //remove extraneous ;
        styledText += `">${text}</span>`;
        return styledText;
    }
    let styledText = `<div class=${className}>`;
    styledText += `${text}</div>`;
    return styledText;
}

// function main() {
//     let checkMarkMap = new Map();
//     checkMarkMap.set("color", "red");
//     checkMarkMap.set("font-size", "20px");
//     const styledResult = innerHtmlStyle("bruh", null, checkMarkMap);
//     console.log(styledResult);
// }

// main();

export default innerHtmlStyle;
