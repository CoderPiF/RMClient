const Process = require('process')
const Alfred = require('./src/utils/alfred')

const User = require('./src/user')

const RMKey = 'rm'

var Actions = {}
Actions.help = function() {
    var list = []
    if (user.hasLogined()) {
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

function main(actionName, targets) {
    var ation = Actions[actionName]
    if (action == undefined) {
        // TODO:
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
