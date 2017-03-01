function warningLog(msg) {
    console.log('[W]' + msg)
}

function infoLog(msg) {
    console.log('[I]' + msg)
}

module.exports = {
    'info': infoLog,
    'warning': warningLog
}
