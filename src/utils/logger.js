function warning(msg) {
    console.log('[W]' + msg)
}

function info(msg) {
    console.log('[I]' + msg)
}

module.exports = {
    'info': info,
    'warning': warning
}
