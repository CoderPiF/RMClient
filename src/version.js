const FileUtils = require('./utils/file')
const Exec = require('child_process').exec
const Logger = require('./utils/logger')
const Utils = require('./utils/utils')

const VersionReg = /\d+\.\d+\.\d+/
const CurrentVersionPath = FileUtils.getFilePath('Version')
const UpdateShellPath = FileUtils.getFilePath('src/updateVersion.sh')

function getNewVersion(callback) {
    var command = "git ls-remote --tags https://github.com/CoderPiF/RMClient.git  | sort -t '/' -k 3 | awk -F/ '{ print $3   }' | tail -n 1"
    Exec(command, function(error, stdout, stderr) {
        callback(stdout)
    })
}

function trimVersion(version) {
    var res = version.match(VersionReg)
    if (res == undefined || res.length == undefined || res.length == 0) return ''
    return res[0]
}

function checkVersion() {
    var curVersion = trimVersion(FileUtils.readTextFromFile(CurrentVersionPath))
    getNewVersion(function(newVersion) {
        if (newVersion == undefined || typeof(newVersion) != 'string' || !VersionReg.test(newVersion)) return
        newVersion = trimVersion(newVersion)

        if (newVersion == curVersion) {
            Logger.info('已经是最新版本了')
        } else {
            Utils.showAlert({
                'title': '版本更新',
                'text': '更新版本了，是否更新？',
                'label': '当前版本: ' + curVersion + '\n最新版本: ' + newVersion
            }, function(confirm) {
                if (confirm) {
                    Exec(UpdateShellPath + ' ' + newVersion + ' ' + FileUtils.AppRoot)
                }
            })
        }
    })
}

module.exports = {
    'checkVersion': checkVersion
}
