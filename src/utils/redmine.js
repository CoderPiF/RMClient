const Request = require('request')
const QueryString = require('query-string')
const URL = require('url')

var Config = {
    'ServerUrl': '',
    'APIKey': ''
}

function doConfig(serverUrl, apiKey) {
    Config.ServerUrl = serverUrl
    Config.APIKey = apiKey
}
function hasConfig() {
    return Config.ServerUrl.length > 0 && Config.APIKey.length > 0
}

function isRespOK(err, resp) {
    return (!err && 200 <= resp.statusCode && resp.statusCode < 300)
}

function getHeaders() {
    return {
        'X-Redmine-API-Key': Config.APIKey
    }
}

function get(urlPath, param, callback) {
    if (!hasConfig()) {
        callback('not config yet', { 'statusCode': 404 })
        return
    }
    var url = URL.resolve(Config.ServerUrl, urlPath)
    if (typeof(param) == 'object' && Object.keys(param).length > 0) {
        url += '?' + QueryString.stringify(param)
    }
    Request({
        url: url,
        headers: getHeaders()
    }, callback)
}

function normalGet(urlPath, param, targetKey, callback) {
    get(urlPath, param, function(err, resp, body) {
        if (isRespOK(err, resp)) {
            var target = JSON.parse(body)
            if (typeof(targetKey) == 'string' && targetKey.length > 0) {
                target = target[targetKey]
            }
            if (target != undefined) {
                callback(target)
                return
            }
        }
        callback()
    })
}

function getCurrentUser(callback) {
    normalGet('/users/current.json', {}, 'user', callback)
}

function getMyIssues(callback) {
    normalGet('/issues.json', {
        'assigned_to_id': 'me'
    }, 'issues', callback)
}

module.exports = {
    'config': doConfig,
    'getCurrentUser': getCurrentUser,
    'getMyIssues': getMyIssues
}
