const dfa = require('./dfa.js')
const utils = require('./utils.js')

let keywords = ['char', 'double', 'enum', 'float', 'int', 'long', 'short', 'signed', 'struct', 'union', 'unsigned', 'void',
  'for', 'do', 'while', 'break', 'continue', 'if', 'else', 'goto',
  'switch', 'case', 'default', 'return', 'auto', 'extern', 'register', 'static',
  'const', 'sizeof', 'typedef', 'volatile'
]
let emptychars = ['\t', ' ', '\r', '\v', '\f']
let symbol_start = ['+', '-', '*', '/', '%', '<', '>', '=', '!', '&', '|', '[', ']', '(', ')', '{', '}', ';', ':', ',', '.']

function init() {
  dfa.init()
}

function analyze(str) {
  let analysis = []
  let errors = []
  let smallBrackets = []
  let middleBrackets = []
  let largeBrackets = []
  let lineNumber = 1
  let index = 0
  let column = 1
  while (index < str.length) {
    let char = str.charAt(index)
    if (emptychars.indexOf(char) != -1) {
      index++
      column++
      continue
    }
    if (char == '\n') {
      index++
      lineNumber++
      column = 1
      continue
    }
    if (char == '"') {
      let startc = column
      let start = index
      index ++
      column ++
      while (str.charAt(index) != '"' && str.charAt(index) != '\n' && index < str.length) {
        index++
        column++
      }
      if (str.charAt(index) == '"') {
        index++
        column++
        analysis.push({
          'raw': str.substring(start, index),
          'type': 'STRING',
          'lineNumber': lineNumber,
          'attribute': str.substring(start, index),
          'startc': startc,
          "endc": column
        })
      } else if(str.charAt(index) == '\n') {
        index ++
        errors.push({
          'raw': str.substring(start, index),
          'lineNumber': lineNumber,
          'info': '未闭合的 "',
          'startc': startc,
          'endc': column
        })
        lineNumber ++
        column = 1
      } else {
        errors.push({
          'raw': str.substring(start, index),
          'lineNumber': lineNumber,
          'info': '未闭合的 "',
          'startc': startc,
          'endc': column
        })
      }
      continue
    }
    if(char == '\'') {
      let startc = column
      let start = index
      index ++
      column ++
      if(str.charAt(index + 1) == '\'') {
        analysis.push({
          'raw': str.substring(start, index+2),
          'type': 'CHARACTER',
          'lineNumber': lineNumber,
          'attribute': str.substring(start, index+2),
          'startc': startc,
          'endc': column+2
        })
        index += 2
        column += 2
      } else if(str.charAt(index) == '\\' && str.charAt(index+2) == '\''){
        analysis.push({
          'raw': str.substring(start, index+3),
          'type': 'CHARACTER',
          'lineNumber': lineNumber,
          'attribute': str.substring(start, index+3),
          'startc': startc,
          'endc': column+3
        })
        index += 3
        column += 3
      } else {
        while(str.charAt(index) != '\'' && str.charAt(index) != '\n' && index < str.length) {
          index ++
          column ++
        }
        if(index == str.length) {
          errors.push({
            'raw': str.substring(start, index+1),
            'lineNumber': lineNumber,
            'info': '过长字符',
            'startc': startc,
            'endc': column
          })
        } else if(str.charAt(index) == '\'') {
          errors.push({
            'raw': str.substring(start, index+1),
            'lineNumber': lineNumber,
            'info': '过长字符',
            'startc': startc,
            'endc': column+1
          })
          index ++
          column ++
        } else {
          errors.push({
            'raw': str.substring(start, index),
            'lineNumber': lineNumber,
            'info': '未闭合的 \'',
            'startc': startc,
            'endc': column+1
          })
          index ++
          lineNumber ++
          column = 1
        }
      }
      continue
    }
    if (char == '/' && str.charAt(index + 1) == '/') {
      while (str.charAt(index) != '\n' && index < str.length) {
        index++
        column++
      }
      if (str.charAt(index) == '\n') {
        index++
        lineNumber++
        column = 1
      }
      continue
    }
    if (char == '/' && str.charAt(index + 1) == '*') {
      let startLine = lineNumber
      let startc = column
      while ((str.charAt(index) != '*' || str.charAt(index + 1) != '/') && index < str.length) {
        if (str.charAt(index) == '\n') {
          lineNumber++
          column = 1
        }
        index++
        column++
      }
      if (str.charAt(index) == '*' && str.charAt(index + 1) == '/') {
        index += 2
        column += 2
      } else {
        errors.push({
          'raw': '/*',
          'lineNumber': startLine,
          'info': '未闭合的注释 /*',
          'startc': startc,
          'endc': startc+2
        })
      }
      continue
    }
    if (utils.isLetter_(char) == true) {
      let startc = column
      let res = dfa.judgeId(str, index, column)
      if (res.status == 'ok') {
        if (keywords.indexOf(res.raw) != -1) {
          analysis.push({
            'raw': res.raw,
            'type': res.raw.toUpperCase(),
            'lineNumber': lineNumber,
            'attribute': '-',
            'startc': startc,
            'endc': res.nextstartc
          })
        } else {
          analysis.push({
            'raw': res.raw,
            'type': 'ID',
            'lineNumber': lineNumber,
            'attribute': res.raw,
            'startc': startc,
            'endc': res.nextstartc
          })
        }
      } else {
        errors.push({
          'raw': res.raw,
          'lineNumber': lineNumber,
          'info': '格式错误的 ID: ' + res.raw,
          'startc': res.startc,
          'endc': res.nextstartc
        })
      }
      index = res.nextstart
      column = res.nextstartc
      continue
    }
    if (utils.isNum(char) == true) {
      let startc = column
      if(char == '0' && utils.isNum(str.charAt(index + 1))) {
        
        // 八进制
        let res = dfa.judgeOct(str, index, column)
        if (res.status == 'ok') {
          analysis.push({
            'raw': res.raw,
            'type': 'OCT',
            'lineNumber': lineNumber,
            'attribute': res.raw,
            'startc': startc,
            'endc': res.nextstartc
          })
        } else {
          errors.push({
            'raw': res.raw,
            'lineNumber': lineNumber,
            'info': '格式错误的 八进制数: ' + res.raw,
            'startc': res.startc,
            'endc': res.nextstartc,
            'startc': startc,
            'endc': res.nextstartc
          })
        }
        index = res.nextstart
        column = res.nextstartc
        continue
      } else if (char == '0' && (str.charAt(index + 1) == 'x' || str.charAt(index + 1) == 'X')) {

        // 十六进制
        let res = dfa.judgeHex(str, index, column)
        if (res.status == 'ok') {
          analysis.push({
            'raw': res.raw,
            'type': 'HEX',
            'lineNumber': lineNumber,
            'attribute': res.raw,
            'startc': startc,
            'endc': res.nextstartc
          })
        } else {
          errors.push({
            'raw': res.raw,
            'lineNumber': lineNumber,
            'info': '格式错误的 十六进制数: ' + res.raw,
            'startc': res.startc,
            'endc': res.nextstartc,
            'startc': startc,
            'endc': res.nextstartc
          })
        }
        index = res.nextstart
        column = res.nextstartc
        continue

      } else {

        // 十进制
        let res = dfa.judgeNum(str, index, column)
        if (res.status == 'ok') {
          analysis.push({
            'raw': res.raw,
            'type': 'DECIMAL',
            'lineNumber': lineNumber,
            'attribute': res.raw,
            'startc': startc,
            'endc': res.nextstartc
          })
        } else {
          errors.push({
            'raw': res.raw,
            'lineNumber': lineNumber,
            'info': '格式错误的 十进制数: ' + res.raw,
            'startc': res.startc,
            'endc': res.nextstartc
          })
        }
        index = res.nextstart
        column = res.nextstartc
        continue
      }
    }
    if (symbol_start.indexOf(char) != -1) {
      let startc = column
      let res = dfa.judgeSymbol(str, index, column)
      if (res.status == 'ok') {
        if(res.raw == '(') {
          smallBrackets.push({
            lineNumber: lineNumber,
            column: column
          })
        } else if(res.raw == '[') {
          middleBrackets.push({
            lineNumber: lineNumber,
            column: column
          })
        } else if(res.raw == '{') {
          largeBrackets.push({
            lineNumber: lineNumber,
            column: column
          })
        } else if(res.raw == ')') {
          if(smallBrackets.length == 0) {
            errors.push({
              'raw': ')',
              'lineNumber': lineNumber,
              'info': '未匹配的 )',
              'startc': column,
              'endc': res.nextstartc
            })
          } else {
            smallBrackets.pop()
          }
        } else if(res.raw == ']') {
          if(middleBrackets.length == 0) {
            errors.push({
              'raw': ']',
              'lineNumber': lineNumber,
              'info': '未匹配的 ]',
              'startc': column,
              'endc': res.nextstartc
            })
          } else {
            middleBrackets.pop()
          }
        } else if(res.raw == '}') {
          if(largeBrackets.length == 0) {
            errors.push({
              'raw': '}',
              'lineNumber': lineNumber,
              'info': '未匹配的 }',
              'startc': column,
              'endc': res.nextstartc
            })
          } else {
            largeBrackets.pop()
          }
        }
        analysis.push({
          'raw': res.raw,
          'type': res.type,
          'lineNumber': lineNumber,
          'attribute': '-',
          'startc': startc,
          'endc': res.nextstartc
        })
      } else {
        errors.push({
          'raw': res.raw,
          'lineNumber': lineNumber,
          'info': '格式错误的 符号: ' + res.raw,
          'startc': res.startc,
          'endc': res.nextstartc
        })
      }
      index = res.nextstart
      column = res.nextstartc
      continue
    }
    errors.push({
      'raw': char,
      'lineNumber': lineNumber,
      'info': '未知字符: ' + char,
      'startc': column,
      'endc': column+1
    })
    index++
    column++
  }
  if(smallBrackets.length != 0) {
    for(item of smallBrackets) {
      errors.push({
        'raw': '(',
        'lineNumber': item.lineNumber,
        'info': '未闭合的 (',
        'startc': item.column,
        'endc': item.column+1
      })
    }
  }
  if(middleBrackets.length != 0) {
    for(item of middleBrackets) {
      errors.push({
        'raw': '[',
        'lineNumber': item.lineNumber,
        'info': '未闭合的 [',
        'startc': item.column,
        'endc': item.column+1
      })
    }
  }
  if(largeBrackets.length != 0) {
    for(item of largeBrackets) {
      errors.push({
        'raw': '{',
        'lineNumber': item.lineNumber,
        'info': '未闭合的 {',
        'startc': item.column,
        'endc': item.column+1
      })
    }
  }
  return {
    analysis, errors
  }
}

exports.init = init
exports.analyze = analyze