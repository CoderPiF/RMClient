const Process = require('process')
const Alfred = require('./src/utils/alfred')
const Logger = require('./src/utils/logger')

const User = require('./src/user')
const Issues = require('./src/issues')
const Projects = require('./src/projects')
const Redmine = require('./src/utils/redmine')

const RMKey = 'rm'

var Actions = {}
Actions.help = function() {
    var list = []
    if (User.hasLogined()) {
        list = [{
            'title': '任务列表',
            'arg': 'openRM issues'
        }, {
            'title': '创建任务',
            'arg': 'openRM create'
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

Actions.create = function(options) {
    Issues.createIssue(options)
}
Actions.confirmCreate = function(options) {
    Issues.confirmCreate(options, User.info.id)
}

Actions.issues = function() {
    Issues.listIssues()
}

Actions.modify = function(options) {
    Issues.modifyIssue(options)
}
Actions.confirmModify = function(options) {
    Issues.confirmModify(options)
}
Actions.closeIssue = function(options) {
    Issues.closeIssue(options)
}

Actions.lockIssue = function(options) {
    Issues.lockIssue(options[0])
}
Actions.unlockIssue = function(options) {
    Issues.unlockIssue(options[0])
}

Actions.openIssueHome = function(options) {
    Redmine.openIssueHome(options[0])
}

Actions.importProject = function(options) {
    Projects.importProject(options)
}
Actions.confirmImport = function(options) {
    Projects.confirmImportProject(options, function(isSuccess) {
        if (isSuccess) {
            Actions.openRM('create')
        }
    })
}

Actions.lockProject = function(options) {
    Projects.lockProject(options[0])
}
Actions.unlockProject = function(options) {
    Projects.unlockProject(options[0])
}

Actions.selectProject = function(options) {
    Actions.openRM('create ' + options[0] + ' ')
}

function main(actionName, options) {
    var action = Actions[actionName]
    if (action == undefined) {
        Logger.warning('命令不存在：' + actionName)
    } else {
        action(options)
    }
}

var args = Process.argv.slice(2)
if (args.length > 0) {
    main(args[0], args.slice(1))
} else {
    main('help', [])
}
