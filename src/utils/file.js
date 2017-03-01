const FS = require('fs')
const Path = require('path')

const AppRoot = Path.dirname(require.main.filename)

function readObjectFromFile(file) {
    if (FS.existsSync(file)) {
        var obj = FS.readFileSync(file)
        return JSON.parse(obj)
    }
    return {}
}

function writeObjectToFile(obj, file) {
    FS.writeFileSync(file, JSON.stringify(obj))
}

function getFilePath(filename) {
    return Path.join(AppRoot, filename)
}

function deleteFile(file) {
    FS.unlinkSync(file)
}

module.exports = {
    'getFilePath': getFilePath,
    'readObjectFromFile': readObjectFromFile,
    'writeObjectToFile': writeObjectToFile,
    'deleteFile': deleteFile
}
