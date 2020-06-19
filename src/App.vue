<template>
  <div id="app" v-cloak>
    <div class="user-bio">
      <div class="user-bio-top">
        <div class="circle-red"></div>
        <div class="circle-yellow"></div>
        <div class="circle-green"></div>
        <span><strong>
          语法分析器 By Ziyang
        </strong></span>
      </div>
      <div class="user-bio-body">
        <el-row id="upper-div">
          <el-col :span="12">
            <MonacoEditor
              ref="monaco"
              id="monaco"
              @change="handleChange"
              :monacoOptions="monacoOptions"
              v-model="monacoOptions.value"
            ></MonacoEditor>
            <div id="button-group">
              <input type="file" id="files" style="display: none" @change="handleFileChange">
              <el-button type="primary" plain id="read-btn" @click="read_file">读取</el-button>
              <el-button type="primary" plain id="show-btn" @click="show_ll1">LL(1)</el-button>
              <el-button type="danger" plain id="empty-btn" @click="clear">清空</el-button>
              <el-button type="success" plain id="run-btn" @click="analyse">分析</el-button>
              <el-button type="success" plain id="tree-btn" @click="show_tree">树状图</el-button>
            </div>
          </el-col>

          <el-col :span="12">
            <ResTable :resTable="resTable"></ResTable>
          </el-col>
        </el-row>

        <el-row id="down-div">
        <el-col :span="24">
          <ErrorTable :errorTable="errorTable"></ErrorTable>
        </el-col>
      </el-row>
      </div>
    </div>
    <el-dialog title="LL1" :visible.sync="ll1dialogshow">
      <LL1Dialog :table="table"></LL1Dialog>
    </el-dialog>

    <el-dialog title="TreeDialog" :visible.sync="showTree">
      <Tree ref="tree"></Tree>
    </el-dialog>
  </div>
</template>

<script>
import MonacoEditor from "./components/MonacoEditor";
import ResTable from "./components/ResTable"
import ErrorTable from "./components/ErrorTable"
import LL1Dialog from "./components/LL1Dialog"
import Tree from "./components/Tree"
const lexer = require('./script/lexer/lexer.js')
const parser = require('./script/parser/parser.js')

export default {
  name: "App",
  components: {
    MonacoEditor,
    ResTable,
    ErrorTable,
    LL1Dialog,
    Tree
  },
  data() {
    return {
      parser_tree: [],
      monacoOptions: {
        value: "int a = 0;\nchar array[12];\n\nint test();\nvoid test1(int a);\n\nstruct abc {\n\tint a;\n\tchar b;\n\tlong c;\n};\nint main() {\n\tint d = 0;\n\tstruct abc d;\n\tarray[0] = 'a';\n\td.a = 10;\n\tfor(a = 0; a < 10; a ++) {\n\t\tprintf(a);\n\t}\n\td = test();\n\tdo {\n\t\ttest1(d);\n\t\td --;\n\t} while(d > 0);\n\tif(d == a) {\n\t\tprintf(d);\n\t}\n\treturn 0;\n}\n\nint b = 12;\n\nint test() {\n\tint c = b+1;\n\tprintf(b);\n\treturn c;\n}\n\nstruct abcd {\n\tint a;\n\tchar b;\n\tlong c[12];\n};\n\nvoid test1(int a) {\n\tstruct abcd t;\n\tt.b = '\\n';\n\tprintf(a);\n\treturn;\n}",
        minimap: {
          enabled: false
        },
        theme: "vs-light",
        fontSize: 16,
        lineNumbersMinChars: 3,
        lineHeight: 25,
        scrollBeyondLastLine: false,
        language: "c",
        scrollbar: {
          vertical: "hidden",
          verticalScrollbarSize: 0
        }
      },
      resTable: [],
      errorTable: [],
      ll1dialogshow: false,
      table: {},
      showTree: false
    };
  },
  methods: {
    handleChange(value) {
      console.log(value);
    },
    read_file() {
      document.getElementById("files").click()
      document.getElementById('read-btn').blur()
    },
    handleFileChange() {
      let length = document.getElementById("files").files.length
      let selectedFile = document.getElementById("files").files[length-1]
      let reader = new FileReader()
      reader.readAsText(selectedFile)
      reader.onload = () => {
        this.$refs.monaco.setVal(reader.result)
      }
    },
    dropFile(e) {
      this.borderhover = false
      e.stopPropagation();
      e.preventDefault();  //必填字段
      let selectedFile = e.dataTransfer.files[0];
      let reader = new FileReader()
      reader.readAsText(selectedFile)
      reader.onload = () => {
        this.$refs.monaco.setVal(reader.result)
      }
    },
    clear() {
      this.$refs.monaco.clear()
      document.getElementById('empty-btn').blur()
    },
    analyse() {
      document.getElementById('run-btn').blur()
      let str = this.$refs.monaco.getVal()
      let lexer_res = lexer.analyze(str)
      let res = parser.parse(lexer_res.analysis)
      let tmp_errors = lexer_res.errors.concat(res.errors)
      let compare = function (x, y) {//比较函数
        if (x.lineNumber < y.lineNumber) {
          return -1;
        } else if (x.lineNumber > y.lineNumber) {
          return 1;
        } else {
          if (x.startc < y.startc) {
            return -1;
          } else {
            return 1;
          }
        }
      }
      tmp_errors.sort(compare)
      this.errorTable = tmp_errors
      this.resTable = [res.start_ele]
      this.render_errors()
    },
    render_errors() {
      let model = this.$refs.monaco.getModel()
      let modelerrors = []
      this.errorTable.forEach((ele) => {
        modelerrors.push({
          startLineNumber: ele.lineNumber,
          startColumn: ele.startc,
          endLineNumber: ele.lineNumber,
          endColumn: ele.endc,
          message: ele.info,
          severity: monaco.MarkerSeverity.Error
        })
      })
      this.$refs.monaco.setModelMarkers(model, "owner", modelerrors)
    },
    show_ll1() {
      document.getElementById('show-btn').blur()
      this.table = parser.getTable()
      this.ll1dialogshow = true
    },
    show_tree() {
      document.getElementById('tree-btn').blur()
      if(typeof(this.resTable[0]) == 'undefined') {
        alert('请首先分析！')
      } else {
        this.showTree = true
        setTimeout(() => {
          this.$refs.tree.tree(this.resTable[0])
        }, 1000)
      }
    },
  },
  mounted: function () {
      let _this = this
      var dropbox = document.getElementById('monaco');
      dropbox.addEventListener("drop", this.dropFile, false)
      dropbox.addEventListener("dragleave",function (e) {
        e.stopPropagation();
        e.preventDefault();
        _this.borderhover =  false;
      })
      dropbox.addEventListener("dragenter",function (e) {
        e.stopPropagation();
        e.preventDefault();
        _this.borderhover =  true;
      })
      dropbox.addEventListener("dragover",function (e) {
        e.stopPropagation();
        e.preventDefault();
        _this.borderhover =  true
      })
      lexer.init()
      parser.init()
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}
.user-bio {
  font-size: 14px;
  color: #6a737d;
  width: 1300px;
  height: 768px;
  margin: 0 auto;
}
.user-bio .user-bio-top {
  height: 15px;
  background-color: #e3e3e3;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  padding: 8px 0px 8px 0px;
}
.user-bio .user-bio-body {
  background-color: #eeeeee;
  width: 100%;
  font-size: 13px;
  color: #666666;
  overflow: auto;
  text-align: left;
  padding: 5px 0px 10px 0px;
  font-family: "Source Code Pro", Consolas, Menlo, Monaco, "Courier New",
    monospace;
}
.user-bio .user-bio-top div {
  float: left;
  margin-right: 10px;
  width: 13px;
  height: 13px;
  background-color: #ff5f57;
  border-radius: 50px;
}
.circle-red {
  margin-left: 12px;
}
.user-bio .user-bio-top .circle-yellow {
  float: left;
  margin-right: 10px;
  width: 13px;
  height: 13px;
  background-color: #ffbd2e;
  border-radius: 50px;
}
.user-bio .user-bio-top .circle-green {
  float: left;
  margin-right: 10px;
  width: 13px;
  height: 13px;
  background-color: #28ca42;
  border-radius: 50px;
}
.el-button {
  width: 120px;
  font-size: 16px;
  line-height: 1.2;
}
#button-group {
  margin-top: 15px;
  margin-bottom: 15px;
}

#read-btn {
  margin-left: 15px;
}

#show-btn {
  margin-left: 8px;
}

#empty-btn {
  margin-left: 7px;
}

#run-btn {
  margin-left: 7px;
}

#tree-btn {
  margin-left: 8px;
}

#upper-div {
  margin-top: 5px;
  margin-left: 10px;
}

#down-div {
  margin-left: 25px;
  margin-right: 43px;
}

[v-cloak] {
  display: none;
}
</style>
