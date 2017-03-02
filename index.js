const Process = require('process')
const Alfred = require('./src/utils/alfred')
const Logger = require('./src/utils/logger')

const User = require('./src/user')
const Issues = require('./src/issues')
const Redmine = require('./src/utils/redmine')

const RMKey = 'rm'

var Actions = {}
Actions.help = function() {
    var list = []
    if (User.hasLogined()) {
        list = [{
            'title': '任务列表',
            'arg': 'listIssues'
        }, {
            'title': '创建任务',
            'arg': 'createIssue'
        }, {
            'title': '退出登录',
            'arg': 'logout'
        }]
    } else {
        list = [{
            'title': '登录',
            'arg': 'login'
        }]
    }
    console.log(Alfred.createItems(list))
}

Actions.openRM = function(options) {
    options = options || ''
    if (typeof(options) == 'object') {
        options = options.join(' ')
    }
    Alfred.searchText(RMKey + ' ' + options)
}

Actions.login = function() {
    if (User.hasLogined()) {
        Actions.openRM()
        return
    }
    User.login(function(isSuccess) {
        if (isSuccess) {
            Actions.openRM()
        }
    })
}
Actions.logout = function() {
    User.logout()
}

Actions.createIssue = function() {
    Actions.openRM('create ')
}
Actions.create = function() {
    // TODO:
}

Actions.listIssues = function() {
    Actions.openRM('issues')
}
Actions.issues = function() {
    Issues.listIssues()
}

Actions.lockIssue = function(targets) {
    Issues.lockIssue(targets[0])
}
Actions.unlockIssue = function(targets) {
    Issues.unlockIssue(targets[0])
}

Actions.openIssueHome = function(targets) {
    Redmine.openIssueHome(targets[0])
}

function main(actionName, targets) {
    var action = Actions[actionName]
    if (action == undefined) {
        Logger.warning('命令不存在：' + actionName)
    } else {
        action(targets)
    }
}

var args = Process.argv.slice(2)
if (args.length > 0) {
    main(args[0], args.slice(1))
} else {
    main('help', [])
}
