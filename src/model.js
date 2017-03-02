const FileUtils = require('./utils/file')
const Path = require('path')

function copyInitValue(value) {
    if (typeof(value) == 'object') {
        if (Object.prototype.toString.call(value) === '[object Array]') return []
        return {}
    }
    return value
}

function getDataDirectory() {
    return FileUtils.getFilePath('Data')
}

function getSaveFilePath(fileName) {
    var dirPath = getDataDirectory()
    FileUtils.createDirectory(dirPath)
    return Path.join(dirPath, fileName)
}

module.exports = function(config) {
    var Data = {}
    var Value = {}

    function setValue(name, value) {
        var oldValue = Value[name]
        Value[name] = value
        if (Data[name].set != undefined) {
            Data[name].set(oldValue, value)
        }
    }

    function add(name, config) {
        if (typeof(name) != 'string' || name.length == 0) return

        Data[name] = Data[name] || {}
        Data[name].init = config.init || {}
        setValue(name, copyInitValue(Data[name].init))
        Data[name].set = config.set
        Data[name].path = config.path
        Data[name].path = getSaveFilePath(Data[name].path)
    }

    this.read = function(name) {
        setValue(name, FileUtils.readObjectFromFile(Data[name].path, Value[name]))
        return Value[name]
    }
    this.save = function(name, value) {
        if (value != undefined) {
            setValue(name, value)
        }
        FileUtils.writeObjectToFile(Value[name], Data[name].path)
    }
    this.__proto__ = Value

    this.CleanAllData = function() {
        FileUtils.deleteDirectory(getDataDirectory())
    }

    for (var name in config) {
        add(name, config[name])
    }
}
