const Model = require('./model')
const Logger = require('./utils/logger')
const Alfred = require('./utils/alfred')
const Redmine = require('./utils/redmine')

var M = new Model({
    'Projects': {
        'init': [],
        'path': 'Projects'
    }
})

function findProjectIdx(projectId) {
    if (projectId == undefined) return -1
    for (var i = 0; i < M.Projects.length; ++i) {
        if (M.Projects[i].id == projectId) return i
    }
    return -1
}

function isLegalProject(projectId) {
    return (findProjectIdx(projectId) != -1)
}

function convertToAlfredItem(project) {
    return {
        'title': project.name,
        'arg': 'selectProject ' + project.id,
        'mods': {
            'cmd': {
                'subtitle': project.lock ? '取消置顶' : '置顶项目',
                'arg': (project.lock ? 'unlockProject ' : 'lockProject ') + project.id
            }
        }
    }
}

function listProjects() {
    var projectList = []
    function pushProj(isLock) {
        for (var p of M.Projects) {
            var tmpLock = (p.lock == true)
            if (tmpLock == isLock) projectList.push(convertToAlfredItem(p))
        }
    }
    pushProj(true)
    pushProj(false)
    if (M.Projects.length == 0) {
        projectList.push({
            'title': '没有项目可以选择，请先导入项目',
            'arg': 'openRM importProject '
        })
    } else {
        projectList.push({
            'title': '导入项目',
            'arg': 'openRM importProject '
        })
    }

    console.log(Alfred.createItems(projectList))
}

function addProject(project) {
    var idx = findProjectIdx(project.id)
    if (idx == -1) {
        M.Projects.push(project)
    } else {
        var isLock = M.Projects[idx].lock
        M.Projects[idx] = project
        M.Projects[idx].lock = isLock
    }
    M.save('Projects')
}

function doLockProject(projectId, isLock) {
    var idx = findProjectIdx(projectId)
    if (idx != -1) {
        M.Projects[idx].lock = isLock
        M.save('Projects')
    }
}
function lockProject(projectId) {
    doLockProject(projectId, true)
    Logger.info('置顶项目')
}
function unlockProject(projectId) {
    doLockProject(projectId, false)
    Logger.info('取消置顶')
}

function importProject(options) {
    console.log(Alfred.createItems([{
        'title': '请输入project.id进行导入',
        'subtitle': '可以输入id(number),也可以是identify(string)',
        'arg': 'openRM confirmImport ' + options.join(' ')
    }]))
}
function confirmImportProject(options, callback) {
    Redmine.getProject(options[0], function(data) {
        if (typeof(data) == 'object') {
            addProject(data)
            callback(true)
        } else {
            callback(false)
        }
    })
}

module.exports = {
    'isLegalProject': isLegalProject,
    'listProjects': listProjects,
    'lockProject': lockProject,
    'unlockProject': unlockProject,
    'importProject': importProject,
    'confirmImportProject': confirmImportProject
}
M.read('Projects')
