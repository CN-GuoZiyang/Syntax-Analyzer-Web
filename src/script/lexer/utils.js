function isNum(char)
{
  if(char.length != 1) {
    return false
  }
  let reg = /^[0-9]$/
  return reg.test(char)
}

function isHexNum(char)
{
  if(char.length != 1) {
    return false
  }
  let reg = /^[0-9]|[a-f]$/
  return reg.test(char)
}

function isOctNum(char)
{
  if(char.length != 1) {
    return false
  }
  let reg = /^[0-7]$/
  return reg.test(char)
}

function isLetter_(char)
{
  if(char.length != 1) return false
  if(char == '_') return true
  let reg = /^[A-Za-z]$/
  return reg.test(char)
}

exports.isNum = isNum
exports.isHexNum = isHexNum
exports.isOctNum = isOctNum
exports.isLetter_ = isLetter_