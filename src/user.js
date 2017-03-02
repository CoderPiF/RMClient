const Utils = require('./utils/utils')
const Model = require('./model')
const Redmine = require('./utils/redmine')

var M = new Model({
    'Config': {
        'path': 'User.Config'
    },
    'UserInfo': {
        'path': 'User.Info',
        'set': function(oldValue, newValue) {
            module.exports.info = newValue
        }
    }
})

function hasLogined() {
    return M.Config['ServerUrl'] != undefined && M.Config['APIKey'] != undefined
}

function getCurrentUser() {
    Redmine.config(M.Config['ServerUrl'], M.Config['APIKey'])

    M.read('UserInfo')
    // refresh user info
    Redmine.getCurrentUser(function(data) {
        if (typeof(data) == 'object' && data.id != undefined) {
            M.save('UserInfo', data)
            return
        }
        if (M.UserInfo.id == undefined) {
            getCurrentUser() // getCurrentUser untill success
        }
    })
}

function configServer(callback) {
    Utils.showDialog({
        title: '配置Redmine',
        label: '请输入Redmine地址：'
    }, function(isConfirm, text) {
        if (isConfirm) {
            M.Config['ServerUrl'] = text
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
            M.Config['APIKey'] = text
            M.save('Config')
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
                getCurrentUser()
            }
            callback(isConfirm)
        })
    })
}

function logout() {
    M.CleanAllData()
}

module.exports = {
    'hasLogined': hasLogined,
    'login': login,
    'logout': logout,
    'info': M.UserInfo
}
M.read('Config')
if (hasLogined()) {
    getCurrentUser()
}
