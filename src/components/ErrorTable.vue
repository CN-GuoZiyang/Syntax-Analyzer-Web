<template>
  <div>
    <el-table :data="errorTable" border height="190px" style="width: 100%">
      <el-table-column prop="raw" label="错误字串" width="180"></el-table-column>
      <el-table-column prop="lineNumber" label="行号" width="180"></el-table-column>
      <el-table-column prop="info" label="错误信息"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "ErrorTable",
  props: ['errorTable']
};
</script>

<style>
</style>