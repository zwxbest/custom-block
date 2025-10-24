// import './src/db/DbInit.js'
// import './src/db/DbObj.js'
// import './src/db/Rule.js'
// import './src/db/Word.js'
// import './src/CustomBlocker.js'
// import './src/analytics.js'
// import './src/background_legacy.js'
// import './src/background.js'

try {


    importScripts('./src/db/DbInit.js');
    importScripts('./src/db/DbObj.js');
    importScripts('./src/db/Rule.js');
    importScripts('./src/db/Word.js');
    // importScripts('./src/CustomBlocker.js');


    importScripts('./src/rule/Storage.js');
    importScripts('./src/rule/Rule.js');
    importScripts('./src/rule/Word.js');
    importScripts('./src/util.js');
    importScripts('./src/uuid.js');
    importScripts('./src/base64.js');
    importScripts('./src/gitee_sync.js');

    importScripts('./src/analytics.js');
    importScripts('./src/background_legacy.js');
    importScripts('./src/background.js');




} catch (error) {
    console.error(error);
}