<template>
  <div ref="container" id="monaco"></div>
</template>

<script>
import * as monaco from "monaco-editor";
export default {
  name: "MonacoEditor",
  props: {
    monacoOptions: {
      type: Object,
      default: () => {
        return {
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
        };
      }
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.$refs.container.innerHTML = "";
      this.editorOptions = this.monacoOptions;
      this.monacoEditor = monaco.editor.create(
        this.$refs.container,
        this.editorOptions
      );
      this.monacoEditor.onDidChangeModelContent(() => {
        this.$emit("change", this.monacoEditor.getValue());
        this.$emit("input", this.monacoEditor.getValue());
      });
    },
    getVal() {
      return this.monacoEditor.getValue();
    },
    clear() {
      this.monacoEditor.setValue('')
    },
    setVal(value) {
      this.monacoEditor.setValue(value)
    },
    getModel() {
      return this.monacoEditor.getModel()
    },
    setModelMarkers(model, owner, modelerrors) {
      monaco.editor.setModelMarkers(model, owner, modelerrors)
    }
  }
};
</script>

<style>
#monaco {
  height: 400px;
  margin-left: 15px;
  border: 1px solid #ebeef5;
}
</style>