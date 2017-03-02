const Redmine = require('./utils/redmine')
const Alfred = require('./utils/alfred')
const Model = require('./model')
const Util = require('util')
const Utils = require('./utils/utils')
const Logger = require('./utils/logger')
const Projects = require('./projects')

var M = new Model({
    'Issues': {
        'init': [],
        'path': 'Issues'
    },
    'LockingIssues': {
        'path': 'Issues.Lock'
    }
})

// Lock
function lockIssue(issueId) {
    M.LockingIssues[issueId] = Date.now()/1000
    M.save('LockingIssues')
    Logger.info('开始计时')
}
function unlockIssue(issueId) {
    M.LockingIssues[issueId] = undefined
    M.save('LockingIssues')
    Logger.info('停止计时')
}

function getIssueLockTime(issueId) {
    var t = M.LockingIssues[issueId]
    if (t != undefined) return Date.now()/1000 - t
    return t
}

// Alfred Item
function formatTime(time) {
    function timeFormat(t) {
        t = '' + parseInt(t)
        if (t.length < 2) return '0' + t
        return t
    }
    time /= 60
    time = (time < 1) ? 1 : time
    return Util.format('[%s:%s] ', timeFormat(time/60), timeFormat(time%60))
}

function convertToAlfredItem(issue) {
    var lockTime = getIssueLockTime(issue.id)
    var isLock = (lockTime != undefined)
    var title = issue.subject
    if (isLock) {
        title = formatTime(lockTime) + title
    }
    var modifyCmd = 'modifyIssue ' + issue.id
    return {
        'title': title,
        'subtitle': Util.format('%s [%d%%] %s', issue.status.name, issue.done_ratio, issue.due_date),
        'arg': (isLock ? modifyCmd : 'lockIssue ' + issue.id),
        'lock': isLock,
        'mods': {
            'cmd': {
                'subtitle': '编辑',
                'arg': modifyCmd
            },
            'alt': {
                'subtitle': '打开任务主页',
                'arg': 'openIssueHome ' + issue.id
            },
            'ctrl': {
                'subtitle': isLock ? '解除锁定' : '锁定任务',
                'arg': (isLock ? 'unlockIssue ' :  'lockIssue ') + issue.id
            }
        }
    }
}

function convertToAlfredItemList(issues) {
    if (issues.length == 0) {
        return Alfred.createItems([{
            'title': '您当前没有打开的任务',
            'subtitle': '只显示指派给您并且正在打开的任务',
            'valid': false
        }])
    }

    var itemList = []
    for (var issue of issues) {
        itemList.push(convertToAlfredItem(issue))
    }
    itemList.sort(function(a, b) {
        if (a.lock == b.lock) return 0
        if (a.lock) return -1
        return 1
    })
    return Alfred.createItems(itemList)
}

function formatIssues(issues) {
    for (var issue of issues) {
        if (typeof(issue.id) !== 'string') {
            issue.id = '' + issue.id
        }
    }
    return issues
}

function listIssues() {
    Redmine.getMyIssues(function(data) {
        if (typeof(data) == 'object') {
            data = formatIssues(data)
            M.save('Issues', data)
        }
        console.log(convertToAlfredItemList(M.Issues))
    })
}

function createIssue(options) {
    if (!Projects.isLegalProject(options[0])) {
        Projects.listProjects()
        return
    }

    var tips = []
    if (!Utils.hasPreString(options, '#')) {
        tips.push({
            'title': '设置任务时间',
            'subtitle': '使用符号"#"表示任务时间。例如：#10 表示从今天算起，10天后是最后限期',
            'arg': 'openRM create ' + options.join(' ') + ' #'
        })
    }

    tips.push({
        'title': '确认提交',
        'subtitle': '请输入任务标题',
        'arg': 'confirmCreate ' + options.join(' ')
    })

    console.log(Alfred.createItems(tips))
}

function confirmCreate(options, userId) {
    var info = {
        'projectId': options[0]
    }
    for (var i = 1; i < options.length; ++i) {
        if (options[i].startsWith('#')) {
            info['day'] = options[i].substr(1)
        } else {
            info['title'] = info['title'] || []
            info['title'].push(options[i])
        }
    }
    if (info['title'] == undefined) {
        Logger.warning('请输入任务标题')
        return
    } else if (info['day'] == undefined) {
        Logger.warning('请输入任务限期')
        return
    }

    info['title'] = info['title'].join(' ')
    info['userId'] = userId

    Redmine.createIssue(info, function(isSuccess) {
        if (isSuccess) {
            Logger.info('添加任务成功')
        } else {
            Logger.info('添加任务失败')
        }
    })
}

module.exports = {
    'listIssues': listIssues,
    'lockIssue': lockIssue,
    'unlockIssue': unlockIssue,
    'createIssue': createIssue,
    'confirmCreate': confirmCreate
}
M.read('Issues')
M.read('LockingIssues')
