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
function doUnlockIssue(issueId) {
    M.LockingIssues[issueId] = undefined
    M.save('LockingIssues')
}
function unlockIssue(issueId) {
    doUnlockIssue(issueId)
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
    var modifyCmd = 'openRM modify ' + issue.id + ' '
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

// Issues
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

function getIssues(issueId) {
    for (var issue of M.Issues) {
        if (issue.id == issueId)
            return issue
    }
}

function modifyIssue(options) {
    var issueId = options[0]

    var tips = []

    // lockTime
    if (!Utils.hasPreString(options, '#')) {
        var lockTime = getIssueLockTime(issueId)
        var tmp = {
            'title': '记录工时',
            'subtitle': '单位是小时，请输入小数',
            'arg': 'openRM modify ' + options.join(' ') + ' #'
        }
        if (lockTime != undefined) {
            tmp['arg'] += (lockTime/(60*60)).toFixed(2) + ' '
        }
        tips.push(tmp)
    }

    // progress
    if (!Utils.hasPreString(options, '%')) {
        var issue = getIssues(issueId)
        var progress = (issue == undefined || issue.done_ratio == 0 ? '' : issue.done_ratio)
        tips.push({
            'title': '修改进度',
            'subtitle': '最大100，请输入整数',
            'arg': 'openRM modify ' + options.join(' ') + ' %' + progress
        })
    }

    tips.push({
        'title': '确认修改',
        'subtitle': '请使用"#xxx"记录时间，使用"%xx"修改进度',
        'arg': 'confirmModify ' + options.join(' ')
    })

    tips.push({
        'title': '关闭任务',
        'arg': 'closeIssue ' + options.join(' ')
    })

    console.log(Alfred.createItems(tips))
}

function parseModifyOptions(options) {
    var info = {
        'issueId': options[0]
    }
    for (var i = 1; i < options.length; ++i) {
        if (options[i].startsWith('#')) {
            info['time'] = options[i].substr(1)
        } else if (options[i].startsWith('%')) {
            info['progress'] = options[i].substr(1)
        }
    }
    return info
}

function doModify(info) {
    Redmine.modifyIssue(info, function(isSuccess) {
        if (isSuccess) {
            doUnlockIssue(info.issueId)
            Logger.info('修改成功')
        } else {
            Logger.info('修改失败')
        }
    })
}

function confirmModify(options) {
    var info = parseModifyOptions(options)
    doModify(info)
}

function closeIssue(options) {
    var info = parseModifyOptions(options)
    info['status'] = 'closed'
    doModify(info)
}

module.exports = {
    'listIssues': listIssues,
    'lockIssue': lockIssue,
    'unlockIssue': unlockIssue,
    'createIssue': createIssue,
    'confirmCreate': confirmCreate,
    'modifyIssue': modifyIssue,
    'confirmModify': confirmModify,
    'closeIssue': closeIssue
}
M.read('Issues')
M.read('LockingIssues')
