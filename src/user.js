const Utils = require('./utils/utils')
const FileUtils = require('./utils/file')

const ConfigPath = FileUtils.getFilePath('User.Config')

function saveConfig() {
    FileUtils.writeObjectToFile(module.exports.config, ConfigPath)
}
function readConfig() {
    module.exports.config = FileUtils.readObjectFromFile(ConfigPath)
}

function hasLogined() {
    return !!module.exports.config['ServerUrl'] && !!module.exports.config['APIKey']
}

function configServer(callback) {
    Utils.showDialog({
        title: '配置Redmine',
        label: '请输入Redmine地址：'
    }, function(isConfirm, text) {
        if (isConfirm) {
            module.exports.config['ServerUrl'] = text
        }
        callback(isConfirm)
    })
}

function configAPIKey(callback) {
    Utils.showDialog({
        title: '登录Redmine',
        label: '请输入API Key:'
    }, function(isConfirm, text) {
        if (isConfirm) {
            module.exports.config['APIKey'] = text
            saveConfig()
        }
        callback(isConfirm)
    })
}

function login(callback) {
    configServer(function(isConfirm) {
        if (isConfirm) {
            callback(false)
            return
        }
        configAPIKey(callback)
    })
}

function logout() {
    module.exports.config = {}
    FileUtils.deleteFile(ConfigPath)
}

module.exports = {
    'hasLogined': hasLogined,
    'login': login,
    'logout': logout,
    'config': {}
}
readConfig()

