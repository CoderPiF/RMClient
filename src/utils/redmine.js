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

function isRespOK(err, resp) {
    return (!err && 200 <= resp.statusCode && resp.statusCode < 300)
}

function getHeaders() {
    return {
        'X-Redmine-API-Key': Config.APIKey
    }
}

function get(urlPath, param, callback) {
    var url = URL.resolve(Config.ServerUrl, urlPath)
    if (typeof(param) == 'object' && Object.keys(param).length > 0) {
        url += '?' + QueryString.stringify(param)
    }
    Request({
        url: url,
        headers: getHeaders()
    }, callback)
}

function getUserInfo(callback) {
    get('/users/current.json', {}, function(err, resp, body) {
        if (isRespOK(err, resp)) {
            var obj = JSON.parse(body)
            if (obj.user != undefined) {
                callback(obj.user)
                return
            }
        }
        callback()
    })
}

module.exports = {
    'config': doConfig,
    'getUserInfo': getUserInfo
}
