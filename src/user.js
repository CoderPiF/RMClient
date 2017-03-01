const Utils = require('./utils/utils')
const FileUtils = require('./utils/file')
const Redmine = require('./utils/redmine')

const ConfigPath = FileUtils.getFilePath('User.Config')
const UserInfoPath = FileUtils.getFilePath('User.Info')
var Config = {}
var UserInfo = {}

function hasLogined() {
    return !!Config['ServerUrl'] && !!Config['APIKey']
}

function readUserInfo() {
    UserInfo = FIleUtils.readObjectFromFile(UserInfoPath)
    module.exports.info = UserInfo
}
function saveUserInfo() {
    FIleUtils.writeObjectToFile(UserInfo, UserInfoPath)
}

function getUserInfo() {
    Redmine.config(Config['ServerUrl'], Config['APIKey'])

    readUserInfo()
    // refresh user info
    Redmine.getUserInfo(function(resp) {
        if (typeof(resp) == 'object' && resp.id != undefined) {
            UserInfo = resp
            module.exports.info = UserInfo
            saveUserInfo()
            return
        }
        if (UserInfo.id == undefined) {
            getUserInfo() // getUserInfo untill success
        }
    })
}

function readConfig() {
    Config = FileUtils.readObjectFromFile(ConfigPath)
    if (hasLogined()) {
        getUserInfo()
    }
}
function saveConfig() {
    FileUtils.writeObjectToFile(Config, ConfigPath)
}

function configServer(callback) {
    Utils.showDialog({
        title: '配置Redmine',
        label: '请输入Redmine地址：'
    }, function(isConfirm, text) {
        if (isConfirm) {
            Config['ServerUrl'] = text
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
            Config['APIKey'] = text
            saveConfig()
        }
        callback(isConfirm)
    })
}

function login(callback) {
    configServer(function(isConfirm) {
        if (!isConfirm) {
            callback(false)
            return
        }
        configAPIKey(function(isConfirm) {
            if (isConfirm) {
                getUserInfo()
            }
            callback(isConfirm)
        })
    })
}

function logout() {
    Config = {}
    FileUtils.deleteFile(ConfigPath)
}

module.exports = {
    'hasLogined': hasLogined,
    'login': login,
    'logout': logout,
    'info': UserInfo
}
readConfig()
