// ==UserScript==
// @name         Overwrite Site JS
// @namespace    http://tampermonkey.net/
// @version      2023-12-25
// @description  Overwrite a JS file in a website.
// @author       CriShoux
// @match        https://play2048.co/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=play2048.co
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

console.log('Running tamper...');

let blockCount = 0;

const ORIGINAL_SRC_URL = `https://play2048.co/dist/index.js`;
const MODS = {
    makeAllTwosSpawnAsSixtyFours: (modifiedSrc) => {
        return modifiedSrc.replace('var t=this,', `if (e.value === 2) { e.value = 64 } var t=this,`);
    },
};

window.addEventListener('beforescriptexecute', async (e) => {
    if (blockCount >= 1) return;

    // May also have to use e.target.textContent
    if (e.target.src.search(/dist\/index.js/) != -1) {
        console.log('Target file found!');

        blockCount++;
        e.preventDefault();
        e.stopPropagation();

        console.log(`Fetching ${ORIGINAL_SRC_URL}`);
        const originalSrc = await (await fetch(ORIGINAL_SRC_URL)).text();

        let modifiedSrc = originalSrc;
        for (const modName in MODS) {
            const mod = MODS[modName];
            modifiedSrc = mod(modifiedSrc);
        }

        const newScript = document.createElement('script');
        newScript.type = 'text/javascript';
        newScript.textContent = modifiedSrc;
        document.querySelector('head').appendChild(newScript);

        // window.onload(); // Trigger the script. This line may not be necessary depending on the target file.

        console.log('Tamper successfully ran!');
    }
});
