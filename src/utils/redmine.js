const Request = require('request')
const QueryString = require('query-string')
const URL = require('url')
const ExecSync = require('child_process').execSync

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

function jsonRequest(urlPath, method, param, callback) {
    var url = URL.resolve(Config.ServerUrl, urlPath)
    Request({
        url: url,
        method: method,
        headers: getHeaders(),
        json: true,
        body: param
    }, callback)
}


function post(urlPath, param, callback) {
    jsonRequest(urlPath, 'POST', param, callback)
}

function put(urlPath, param, callback) {
    jsonRequest(urlPath, 'PUT', param, callback)
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

function openIssueHome(issueId) {
    var url = URL.resolve(Config.ServerUrl, '/issues/' + issueId)
    ExecSync('open ' + url)
}

function getProject(projectId, callback) {
    normalGet('/projects/' + projectId + '.json', {}, 'project', callback)
}

function formatDateString(date) {
    var dd = date.getDate();
    var mm = date.getMonth()+1; //January is 0!

    var yyyy = date.getFullYear();
    if(dd<10){
        dd='0'+dd;
    }
    if(mm<10){
        mm='0'+mm;
    }
    return yyyy + '-' + mm + '-' + dd
}

function todayAddDay(day) {
    var date = new Date()
    date.setDate(date.getDate() + parseInt(day))
    return date
}

function createIssue(info, callback) {
    var param = {
        'issue': {
            'project_id': info.projectId,
            'subject': info.title,
            'assigned_to_id': info.userId,
            'start_date': formatDateString(todayAddDay(0)),
            'due_date': formatDateString(todayAddDay(info.day))
        }
    }
    post('/issues.json', param, function(err, resp, body) {
        callback(isRespOK(err, resp))
    })
}

function modifyIssue(info, callback) {
    var param = {
        'issue': {}
    }
    if (info.time !== undefined) {
        param['time_entry'] = {
            'hours': Number(info.time)
        }
    }
    if (info.status !== undefined) {
        param.issue['status_id'] = (info.status === 'closed') ? 5 : 2
    }
    if (info.progress !== undefined) {
        param.issue['done_ratio'] = Number(info.progress)
    }
    put('/issues/' + info.issueId + '.json', param, function(err, resp, body) {
        callback(isRespOK(err, resp))
    })
}

module.exports = {
    'config': doConfig,
    'getCurrentUser': getCurrentUser,
    'getMyIssues': getMyIssues,
    'openIssueHome': openIssueHome,
    'getProject': getProject,
    'createIssue': createIssue,
    'modifyIssue': modifyIssue
}
