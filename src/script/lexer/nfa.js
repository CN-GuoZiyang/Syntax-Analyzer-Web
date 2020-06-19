function nfa2dfa(data) {
  Array.prototype.uniq = function () {
    let res = [];
    let json = {};
    for (let i = 0; i < this.length; i++) {
      if (!json[this[i]]) {
        res.push(this[i]);
        json[this[i]] = 1;
      }
    }
    return res;
  };
  let nfa = loadnfa(data)
  let dfa = {}
  let res = []
  let state = []
  let stater = []
  dfa.jumpr = []
  nfa.jumpr.forEach((ele) => {
    if(ele != 'empty') {
      dfa.jumpr.push(ele)
    }
  })
  dfa.jump = []
  for(let i = 0; i < dfa.jumpr.length; i ++) {
    dfa.jump[dfa.jumpr[i]] = i
  }
  let statequeue = []
  let first = findAllEmpty(nfa.stater[0], nfa).join('-')
  stater.push(first)
  state[first] = 0
  statequeue.push(first)
  while (statequeue.length !== 0) {
    let cstr = statequeue.shift()
    let current = cstr.split('-')
    let oneline = []
    dfa.jumpr.forEach(element => {
      if (element != 'empty' && element != 'end') {
        let one = []
        current.forEach(el => {
          let b = nfa.nfa[nfa.state[el]][nfa.jump[element]]
          b.forEach(ele => {
            if (ele.length != 0) {
              let emto = findAllEmpty(ele, nfa)
              emto.forEach(em => {
                one.push(em)
              })
            }
          });
        });
        one = one.uniq()
        one.sort()
        if (one.length == 0) {
          oneline.push('-1')
        } else {
          let onestr = one.join('-')
          oneline.push(onestr)
          if(stater.indexOf(onestr) == -1) {
            let cindex = stater.length
            stater.push(onestr)
            state[onestr] = cindex
            statequeue.push(onestr)
          }
        }
      }
    });
    res.push(oneline)
  }
  // 判断每个状态是否是终结状态
  for(let i = 0; i < res.length; i ++) {
    let cline = res[i]
    let cstate = stater[i]
    let states = cstate.split('-')
    let found = false
    for(let j = 0; j < states.length; j ++) {
      let ele = states[j]
      if(nfa.nfa[nfa.state[ele]][nfa.jump['end']] == 'true') {
        cline.push('true')
        found = true
        break
      }
    }
    if(!found) {
      cline.push('false')
    }
  }
  // 添加-1死状态
  let dline = []
  for(let i = 0; i < dfa.jumpr.length-1; i ++) {
    dline.push('-1')
  }
  dline.push('false')
  res.push(dline)
  state['-1'] = stater.length
  stater.push('-1')
  dfa.dfa = res
  dfa.state = state
  dfa.stater = stater
  return dfa
}

function loadnfa(data) {
  let nfa = {}
  data = data.replace('\r', '')
  let res = []
  let lines = data.split('\n')
  let jump = []
  let jumpr = []
  let splits = lines[0].split(',')
  for (let i = 1; i < splits.length; i++) {
    jumpr.push(splits[i])
    jump[splits[i]] = i - 1
  }
  nfa.jumpr = jumpr
  nfa.jump = jump
  let state = []
  let stater = []
  for (let i = 1; i < lines.length; i++) {
    splits = lines[i].split(',')
    stater.push(splits[0])
    state[splits[0]] = i - 1
    let oneline = []
    for (let j = 1; j < splits.length - 1; j++) {
      let tmp = []
      if (splits[j].startsWith('[')) {
        let tmps = splits[j].substring(1, splits[j].length - 1).split(' ')
        for (let k = 0; k < tmps.length; k++) {
          tmp.push(tmps[k])
        }
      } else {
        tmp.push(splits[j])
      }
      oneline.push(tmp)
    }
    oneline.push(splits[splits.length - 1])
    res.push(oneline)
  }
  nfa.state = state
  nfa.stater = stater
  nfa.nfa = res
  return nfa
}

function findAllEmpty(s, nfa) {
  visit = []
  all.length = 0
  return findAll(s, nfa)
}

var visit = []
var all = []

function findAll(s, nfa) {
  all.push(s)
  visit[s] = true
  let to = nfa.nfa[nfa.state[s]][nfa.jump['empty']]
  to.forEach(element => {
    if(element.length != 0 && visit[element] != true) {
      findAll(element, nfa)
    }
  });
  return all
}

exports.nfa2dfa = nfa2dfa