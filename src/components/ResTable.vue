<template>
  <div>
    <el-table
      :data="resTable"
      style="width: 560px; margin-left: 40px;"
      row-key="id"
      :tree-props="{children: 'children'}"
      height="460"
      border
    >
      <el-table-column prop="label" label="标签" fixed></el-table-column>
      <el-table-column prop="lineNumber" label="行号" width="50"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "ResTable",
  props: ['resTable']
};
</script>

<style>
.el-table__header tr,
  .el-table__header th {
    padding: 0;
    height: 40px;
}
.el-table__body tr,
  .el-table__body td {
    padding: 0;
    height: 40px;
}
</style>