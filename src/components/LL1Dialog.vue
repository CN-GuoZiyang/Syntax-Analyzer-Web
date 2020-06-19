<template>
  
    <el-tabs type="border-card" v-cloak style="height: 500px">
      <el-tab-pane label="产生式">
        <el-table
          :data="grammar_production"
          style="width: 100%;"
          :show-header="false"
          border
          max-height="430"
        >
          <el-table-column prop="id" label="id" width="55" fixed></el-table-column>
          <el-table-column prop="left" width="220" align="right"></el-table-column>
          <el-table-column prop="to" width="80" align="center"></el-table-column>
          <el-table-column prop="right"></el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="First集 & Follow集">
        <el-table :data="first_follow" style="width: 100%;" border max-height="430">
          <el-table-column prop="left" width="150" label="非终结符" fixed></el-table-column>
          <el-table-column prop="first" width="500" label="First集"></el-table-column>
          <el-table-column prop="follow" label="Follow集"></el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Select集">
        <el-table :data="selects" style="width: 100%;" border max-height="430">
          <el-table-column prop="id" label="id" width="55" fixed></el-table-column>
          <el-table-column prop="production" width="470" label="产生式"></el-table-column>
          <el-table-column prop="select" label="Select集"></el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="预测分析表">
        <el-table :data="predict_table" style="width: 100%;" border max-height="430">
          <el-table-column
            v-for="(item, i) in predict_table_header"
            :prop="item"
            :label="item"
            :key="i"
            :fixed="i==0"
          ></el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

</template>

<script>
export default {
  name: "ll1dialog",
  props: ["table"],
  computed: {
    grammar_production() {
      if(typeof(this.table.grammar_production) == 'undefined') {
        return []
      }
      let res = []
      let id = 0
      for(let production of this.table.grammar_production) {
        res.push({
          id: id,
          left: production.left,
          to: '==>',
          right: production.right
        })
        id ++
      }
      return res
    },
    first_follow() {
      if(typeof(this.table.first) == 'undefined') {
        return []
      }
      let res = []
      for(let index in this.table.first) {
        if(index == 'uniq') continue
        res.push({
          left: index,
          first: JSON.stringify(this.table.first[index]),
          follow: JSON.stringify(this.table.follow[index])
        })
      }
      return res
    },
    selects() {
      if(typeof(this.table.select) == 'undefined') {
        return []
      }
      let res = []
      let id = 0
      for(let index in this.table.grammar_production) {
        if(index == 'uniq') continue
        res.push({
          id: id,
          production: this.table.grammar_production[index].left + ' ==> ' + this.table.grammar_production[index].right,
          select: JSON.stringify(this.table.select[index])
        })
        id ++
      }
      return res
    },
    predict_table_header() {
      if(typeof(this.table.symbolsr) == 'undefined') {
        return []
      }
      let res = []
      res.push('非终结符')
      for(let i of this.table.symbolsr) {
        res.push(i)
      }
      return res
    },
    predict_table() {
      if(typeof(this.table.predict_table) == 'undefined') {
        return []
      }
      let res = []
      let length = this.predict_table_header.length
      for(let i in this.table.predict_table) {
        if(i == 'uniq') continue
        let obj = {}
        obj.非终结符 = this.table.nonterminalsr[i]
        for(let j = 1; j < length; j ++) {
          if(typeof(this.table.predict_table[i][j-1]) == 'undefined') {
            obj[this.predict_table_header[j]] = '-'
          } else if(this.table.predict_table[i][j-1] == 'synch'){
            obj[this.predict_table_header[j]] = 'synch'
          } else {
            obj[this.predict_table_header[j]] = this.table.grammar_production.indexOf(this.table.predict_table[i][j-1])
          }
        }
        res.push(obj)
      }
      return res
    }
  },
};
</script>

<style>
[v-cloak] {
  display: none;
}
</style>