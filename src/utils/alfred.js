const ExecSync = require('child_process').execSync

function createItems(items) {
    var resItems = []
    for (var item of items) {
        if (typeof(item) == 'string') item = { 'title': item }
        resItems.push({
            'title': item.title,
            'arg': item.arg || item.title,
            'valid': (item.valid == undefined ? true : item.valid),
            'icon': item.icon || 'Icon.png',
            'subtitle': item.subtitle || '',
            'mods': item.mods || {}
        })
    }
    var res = {
        'items': resItems
    }
    return JSON.stringify(res)
}

function searchText(text) {
    ExecSync('osascript -e \'tell application "Alfred 3" to search "' + text + '"\'')
}

module.exports = {
    'createItems': createItems,
    'searchText': searchText
}
