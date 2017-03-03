const FileUtils = require('./utils/file')
const ExecSync = require('child_process').execSync

const CurrentVersionPath = FileUtils.getFilePath('Version')
const NewVersionPath = FileUtils.getFilePath('Data/NewVersion')
const ShellPath = FileUtils.getFilePath('src/updateVersion')

function getNewVersion() {
    ExecSync("git ls-remote --tags https://github.com/CoderPiF/RMClient.git  | sort -t '/' -k 3 | awk -F/ '{ print $3  }' | tail -n 1 > " + NewVersionPath)
}

function checkVersion() {
    var curVersion = FileUtils.readTextFromFile(CurrentVersionPath)
    var newVersion = FileUtils.readTextFromFile(NewVersionPath, curVersion)
    if (curVersion != NewVersion) return false

    getNewVersion()
    return true
}

function updateVersion() {
    var newVersion = FileUtils.readTextFromFile(NewVersionPath)
    if (newVersion == undefined || newVersion.length == 0) return
    ExecSync(ShellPath + ' ' + newVersion + ' ' + FileUtils.AppRoot)
}

module.exports = {
    'checkVersion': checkVersion,
    'updateVersion': updateVersion
}
