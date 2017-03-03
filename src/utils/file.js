const FS = require('fs')
const Path = require('path')

function readTextFromFile(file, defaultValue) {
    if (FS.existsSync(file)) {
        return FS.readFileSync(file, 'utf8')
    }
    return defaultValue || ''
}

function readObjectFromFile(file, defaultValue) {
    if (FS.existsSync(file)) {
        var obj = FS.readFileSync(file, 'utf8')
        return JSON.parse(obj)
    }
    return defaultValue || {}
}

function writeObjectToFile(obj, file) {
    FS.writeFileSync(file, JSON.stringify(obj))
}

function getFilePath(filename) {
    return Path.join(module.exports.AppRoot, filename)
}

function createDirectory(dir) {
    if (!FS.existsSync(dir) || !FS.lstatSync(dir).isDirectory()) {
        FS.mkdirSync(dir)
    }
}
function deleteFile(dir) {
    if (!FS.existsSync(dir)) return
    if (!FS.lstatSync(dir).isDirectory()) {
        FS.unlinkSync(dir)
        return
    }
    FS.readdirSync(dir).forEach(function(file, index) {
        var curPath = Path.join(dir, file)
        deleteFile(curPath)
    })
    FS.rmdirSync(dir)
}

module.exports = {
    'AppRoot': Path.dirname(require.main.filename),
    'getFilePath': getFilePath,
    'readTextFromFile': readTextFromFile,
    'readObjectFromFile': readObjectFromFile,
    'writeObjectToFile': writeObjectToFile,
    'createDirectory': createDirectory,
    'deleteDirectory': deleteFile
}
