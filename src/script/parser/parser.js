let first = []
let follow = []
let select = []
let grammar_production = []
let table = {}

let grammar_str = "P -> P'\nP' -> common commons\ncommons -> common commons\ncommons -> ε\ncommon -> type ID after_part\ncommon -> STRUCT ID struct_body ;\nstruct_body -> { struct_define struct_defines }\nstruct_defines -> struct_define struct_defines\nstruct_defines -> ε\nstruct_define -> type ID array_part ;\narray_part -> [ const ]\narray_part -> ε\nafter_part -> ( args ) func_body\nafter_part -> init vars ;\ntype -> INT\ntype -> SHORT\ntype -> LONG\ntype -> FLOAT\ntype -> DOUBLE\ntype -> VOID\ntype -> CHAR\ntype -> UNSIGNED type\nargs -> type ID arg\nargs -> ε\narg -> , type ID arg\narg -> ε\nfunc_body -> ;\nfunc_body -> block\nblock -> { define_stmts stmts }\ndefine_stmts -> define_stmt define_stmts\ndefine_stmts -> ε\ndefine_stmt -> type ID init vars ;\ndefine_stmt -> STRUCT ID ID ;\ninit -> = expression\ninit -> array_part\ninit -> ε\nvars -> , ID init vars\nvars -> ε\nstmts -> stmt stmts\nstmts -> ε\nstmt -> assign_stmt\nstmt -> jump_stmt\nstmt -> iteration_stmt\nstmt -> if_stmt\nstmt -> switch_stmt\nassign_stmt -> expression ;\njump_stmt -> CONTINUE ;\njump_stmt -> BREAK ;\njump_stmt -> RETURN isnull_expr ;\niteration_stmt -> WHILE ( logical_expression ) block\niteration_stmt -> FOR ( isnull_expr ; isnull_expr ; isnull_expr ) block\niteration_stmt -> DO block WHILE ( logical_expression ) ;\nif_stmt -> IF ( logical_expression ) block result\nresult -> ELSE after_else\nresult -> ε\nafter_else -> block\nafter_else -> if_stmt\nswitch_stmt -> SWITCH ( value ) { case_stmt case_stmts default_stmt }\ncase_stmts -> case_stmt case_stmts\ncase_stmts -> ε\ncase_stmt -> CASE const : stmts\ndefault_stmt -> DEFAULT : stmts\ndefault_stmt -> ε\nlogical_expression -> ! expression bool_expression\nlogical_expression -> expression bool_expression\nbool_expression -> lop expression bool_expression\nbool_expression -> ε\nlop -> &&\nlop -> ||\nisnull_expr -> expression\nisnull_expr -> ε\nexpression -> value operation\noperation -> compare_op value\noperation -> equal_op value\noperation -> ++\noperation -> --\noperation -> ε\ncompare_op -> >\ncompare_op -> >=\ncompare_op -> <\ncompare_op -> <=\ncompare_op -> ==\ncompare_op -> !=\nequal_op -> =\nvalue -> item value'\nvalue' -> + item value'\nvalue' -> - item value'\nvalue' -> ε\nitem -> factor item'\nitem' -> * factor item'\nitem' -> / factor item'\nitem' -> % factor item'\nitem' -> ε\nfactor -> ( value )\nfactor -> ID factor'\nfactor -> const\nfactor' -> array_part\nfactor' -> call_func\nfactor' -> DOT ID\nfactor' -> ε\ncall_func -> ( es )\nes -> expression eps\nes -> ε\neps -> , expression eps\neps -> ε\nconst -> OCT\nconst -> DECIMAL\nconst -> HEX\nconst -> STRING\nconst -> CHARACTER"

function init() {
  let raw = split_grammar_str(grammar_str)
  compute_first(raw)
  compute_follow(raw)
  compute_select(raw)
  construct_table()
}

function split_grammar_str(str) {
  let strs = str.split('\n')
  let res = []
  for (let element of strs) {
    if (element.trim() == '') continue
    let splits = element.split(' -> ')
    if (typeof (res[splits[0]]) == 'undefined') {
      res[splits[0]] = []
    }
    res[splits[0]].push(splits[1]
      .replace(/&&/g, 'AND')
      .replace(/\|\|/g, 'OR')
      .replace(/>=/g, 'GREATER_E').replace(/<=/g, 'LESS_E').replace(/==/g, 'EQUAL').replace(/!=/g, "NOT_E")
      .replace(/\+\+/g, 'INCREMENT').replace(/--/g, 'DECREMENT')
      .replace(/\(/g, 'L_PARENTHESE').replace(/\)/g, 'R_PARENTHESE')
      .replace(/\[/g, 'L_BRCKET').replace(/]/g, 'R_BRCKET')
      .replace(/{/g, 'L_BRACE').replace(/}/g, 'R_BRACE')
      .replace(/,/g, 'COMMA')
      .replace(/;/g, 'SEMICOLON')
      .replace(/!/g, 'NOT')
      .replace(/>/g, 'GREATER').replace(/</g, 'LESS').replace(/=/g, 'ASSIGN')
      .replace(/\+/g, 'PLUS').replace(/-/g, 'MINUS')
      .replace(/\*/g, 'MULTIPLE').replace(/\//g, 'DIVIDE').replace(/%/g, 'MOD')
      .replace(/:/g, 'COLON')
    )
  }
  return res
}

function compute_first(raw) {
  while (true) {
    let end = true

    for (let index in raw) {
      if (index == 'uniq') continue
      if (typeof (first[index]) == 'undefined') {
        first[index] = []
      }
      let current = raw[index]
      current.forEach(element => {
        let els = element.split(' ')
        for (let el of els) {
          // el不在raw中说明是个终结符
          if (typeof (raw[el]) == 'undefined') {
            if (first[index].indexOf(el) == -1) {
              first[index].push(el)
              end = false
            }
            break
          }
          // 非终结符情况
          if (typeof (first[el]) == 'undefined') {
            first[el] = []
          }
          let el_first = first[el]
          for (let f of el_first) {
            if (first[index].indexOf(f) == -1 && f != 'ε') {
              first[index].push(f)
              end = false
            }
          }
          if (el_first.indexOf('ε') != -1) {
            continue
          } else {
            break
          }
        }
      })
    }
    if (end) break
  }
  table.first = first
}

function compute_follow(raw) {
  let start = true
  while (true) {
    let end = true

    // 循环是检查每个产生式
    for (let index in raw) {
      if (index == 'uniq') continue
      if (typeof (follow[index]) == 'undefined') {
        follow[index] = []
      }
      if (start) {
        table.start = index
        follow[index].push('$')
        start = false
      }
      let current = raw[index]
      current.forEach(element => {
        let els = element.split(' ')

        // 处理B -> aAb的情况，first(b)-{e} in Follow(A)，注意这里的b可能是多个符号
        for (let i = 0; i < els.length - 1; i++) {
          if(typeof(raw[els[i]]) != 'undefined') {
            if (typeof (follow[els[i]]) == 'undefined') {
              follow[els[i]] = []
            }
            for(let j = i+1; j < els.length; j ++) {
              if(typeof(raw[els[j]]) == 'undefined') {
                if(follow[els[i]].indexOf(els[j]) == -1) {
                  follow[els[i]].push(els[j])
                  end = false
                }
                break
              } else {
                let firstb = first[els[j]]
                for (let f of firstb) {
                  if (f != 'ε' && follow[els[i]].indexOf(f) == -1) {
                    follow[els[i]].push(f)
                    end = false
                  }
                }
                if(firstb.indexOf('ε') == -1) {
                  break
                } else {
                  continue
                }
              }
            }
          }
        }

        // 处理B->aA或B->aAb且b->e的情况，FOLLOW(B) in FOLLOW(A)，注意这里的b可能是多个符号
        for (let i = els.length - 1; i >= 0; i--) {
          let el = els[i];
          // 最后面是非终结符
          if (typeof (raw[el]) != 'undefined') {
            if (typeof (follow[el]) == 'undefined') {
              follow[el] = []
            }
            for (let f of follow[index]) {
              if (follow[el].indexOf(f) == -1) {
                follow[el].push(f)
                end = false
              }
            }
            if (first[el].indexOf('ε') != -1) {
              continue
            } else {
              break
            }
          } else {
            break
          }
        }
      })
    }
    if (end) break
  }
  table.follow = follow
}

function compute_select(raw) {
  for (let index in raw) {
    if (index == 'uniq') continue
    let b = index
    let a = raw[b]
    for (let i of a) {
      grammar_production.push({
        'left': b,
        'right': i
      })
    }
  }
  table.grammar_production = grammar_production
  for (let index in grammar_production) {
    if(index == 'uniq') continue
    let item = grammar_production[index]
    if (item.right == 'ε') {
      select[index] = follow[item.left]
    } else {
      let rightsplits = item.right.split(' ')
      select[index] = []
      for(let i = 0; i < rightsplits.length; i ++) {
        let cele = rightsplits[i]
        if(typeof(raw[cele]) == 'undefined') {
          select[index].push(cele)
          break
        } else {
          for(let f of first[cele]) {
            if(f != 'ε' && f != 'uniq'&& select[index].indexOf(f) == -1) {
              select[index].push(f)
            }
          }
          if(first[cele].indexOf('ε') == -1) {
            break
          } else {
            continue
          }
        }
      }
    }
  }
  table.select = select
}

function construct_table() {
  let symbols = []
  let symbolsr = []
  select.forEach(element => {
    if (element != 'uniq') {
      element.forEach(ele => {
        if (symbolsr.indexOf(ele) == -1) {
          let i = symbolsr.length
          symbolsr.push(ele)
          symbols[ele] = i
        }
      })
    }
  })
  table.symbols = symbols
  table.symbolsr = symbolsr
  let nonterminals = []
  let nonterminalsr = []
  let predict_table = []
  grammar_production.forEach(element => {
    let left = element.left
    if(nonterminalsr.indexOf(left) == -1) {
      let i = nonterminalsr.length
      nonterminalsr.push(left)
      nonterminals[left] = i
      predict_table.push([])
    }
  })
  table.nonterminals = nonterminals
  table.nonterminalsr = nonterminalsr
  for(let i = 0; i < grammar_production.length; i ++) {
    let element = grammar_production[i]
    let left = element.left
    let selects = select[i]
    selects.forEach(ele => {
      if(typeof(predict_table[nonterminals[left]][symbols[ele]]) != 'undefined') {
        console.log('---- conflect occurs ----')
        console.log('非终结符: ' + left)
        console.log('输入符号: ' + ele)
        console.log('当前产生式: ')
        console.log(element)
        console.log('已存在产生式: ')
        console.log(predict_table[nonterminals[left]][symbols[ele]])
        console.log('------- conflict --------')
        console.log()
      } else {
        predict_table[nonterminals[left]][symbols[ele]] = element
      }
    })
  }
  for(let left in table.nonterminals) {
    if(left == 'uniq') continue
    let follow_left = table.follow[left]
    for(let ele of follow_left) {
      if(typeof(predict_table[nonterminals[left]][symbols[ele]]) == 'undefined') {
        predict_table[nonterminals[left]][symbols[ele]] = 'synch'
      }
    }
  }
  table.predict_table = predict_table
}

function parse(token) {
  let stack = []
  let start_ele = {
    label: table.start,
    children: []
  }
  stack.push({
    label: '$',
    children: []
  })
  stack.push(start_ele)
  token.push({
    raw: '$',
    type: '$',
    lineNumber: token[token.length-1].lineNumber
  })
  let current_index = 0
  let errors = []
  let id = 0
  while(stack.length != 0 && current_index < token.length) {
    id ++
    let top = stack[stack.length-1]
    let s = token[current_index]
    let lineNumber = s.lineNumber
    if(top.label == 'ε') {
      top.lineNumber = lineNumber
      top.id = id
      stack.pop()
      continue
    }
    // 栈顶是终结符
    if(typeof(table.nonterminals[top.label]) == 'undefined') {
      if(top.label == s.type) {
        top.label = top.label + ' : ' + s.raw
        top.lineNumber = lineNumber
        top.id = id
        stack.pop()
        current_index ++
      } else {
        // 栈顶终结符与输入符号不一致
        errors.push({
          raw: s.raw,
          lineNumber: s.lineNumber,
          info: '语法错误：不匹配的非终结符',
          startc: s.startc-1,
          endc: s.startc
        })
        top.lineNumber = lineNumber
        top.id = id
        stack.pop()
        continue
      }
    } else { // 栈顶是非终结符
      // 使用产生式替换
      let production = table.predict_table[table.nonterminals[top.label]][table.symbols[s.type]]
      if(typeof(production) == 'undefined') {
        // 恐慌模式，忽略输入符号
        errors.push({
          raw: s.raw,
          lineNumber: s.lineNumber,
          info: '语法错误：恐慌模式',
          startc: s.startc,
          endc: s.endc
        })
        top.lineNumber = lineNumber
        top.id = id
        current_index ++
        continue
      } else if(production == 'synch') {
        errors.push({
          raw: s.raw,
          lineNumber: s.lineNumber,
          info: '语法错误：SYNCH词法单元',
          startc: s.startc-1,
          endc: s.startc
        })
        top.lineNumber = lineNumber
        top.id = id
        stack.pop()
        continue
      }
      let right = production.right.split(' ')
      top.lineNumber = lineNumber
      top.id = id
      stack.pop()
      for(let i = right.length-1; i >= 0; i --) {
        let one = {
          label: right[i],
          children: []
        }
        top.children.unshift(one)
        stack.push(one)
      }
    }
  }
  return {start_ele, errors}
}

function getTable() {
  return table
}

exports.init = init
exports.parse = parse
exports.getTable = getTable