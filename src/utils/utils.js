const Dialog = require('cocoa-dialog')

function showDialog(options, callback) {
    Dialog('inputbox', {
        title: options.title,
        informativeText: options.label,
        button1: '确认',
        button2: '取消'
    }).then(result => {
        var tmp = result.split('\n')
        if (tmp.length < 2 || tmp[0] !== '1') {
            callback(false)
        } else {
            callback(true, tmp[1])
        }
    })
}

function showAlert(title, callback) {
    Dialog('yesno-msgbox', {
        title: title,
        button1: '确认',
        button2: '取消'
    }).then(result => {
        callback(result === '1')
    })
}

function hasPreString(listString, preString) {
    for (var str of listString) {
        if (str.startsWith(preString)) return true
    }
    return false
}

module.exports = {
    'showDialog': showDialog,
    'showAlert': showAlert,
    'hasPreString': hasPreString
}
