<template>
  <div>
    <div class="chartTooltip hidden">
      <p>
        <strong class="name"></strong>
      </p>
    </div>
    <div class="tree" id="tree"></div>
  </div>
</template>

<script>
const d3 = require("d3");

export default {
  name: "Tree",
  methods: {
    tree(flare) {
      var width = document.getElementById("tree").offsetWidth;
      var height = document.getElementById("tree").offsetHeight;
      var i = 0,
        duration = 750,
        root;

      var tree = d3.layout.tree().size([height, width]);
      // var tree = d3.layout.tree().nodeSize([100,50]) // 如果子节点太多重叠，可以用这个, nodeSize 会覆盖掉size 更改 g 的 transform y轴 height / 2

      var diagonal = d3.svg.diagonal().projection(function(d) {
        return [d.y, d.x];
      });
      // 反方向 线位置
      // var diagonal = d3.svg.diagonal() .projection(function (d) { return [-d.y, d.x]; });

      var zoom = d3.behavior
        .zoom()
        .scaleExtent([0.1, 100])
        .on("zoom", zoomed); //添加放大缩小事件

      var svg = d3
        .select("body")
        .select("#tree")
        .append("svg")
        .call(zoom) //给svg绑定zoom事件
        // .on('dblclick.zoom', null) // 禁用双击事件
        // .on('wheel.zoom', null)// 禁用缩放事件
        .append("g")
        .attr("transform", "translate(150, 0)");
      // .attr("transform", "translate(150, " + height / 2 + ")")

      zoom.translate([150, 0]);
      // zoom.translate([150,height / 2])

      function zoomed() {
        svg.attr(
          "transform",
          "translate(" +
            d3.event.translate +
            ")" +
            "scale(" +
            d3.event.scale +
            ")"
        );
      }

      root = flare;
      root.x0 = height / 2;
      root.y0 = 0;

      //(1) 折叠函数，递归调用,有子孙的就把children（显示）给_children（不显示）暂存，便于折叠，
      function collapse(d) {
        if (d.children) {
          d._children = d.children;
          d._children.forEach(collapse);
          d.children = null;
        }
      }

      // 折叠根节点的每个孩子
      root.children.forEach(collapse);

      // 折叠之后要重绘
      update(root);
      //(2) 更新布局
      function update(source) {
        // (2-1) 计算新树的布局
        var nodes = tree.nodes(root).reverse(),
          links = tree.links(nodes);

        // (2-2) 树的深度这里树d.y。树的宽度最大720，要分四层，所以每层就乘180
        nodes.forEach(function(d) {
          d.y = d.depth * 180; // 树的x,y倒置了，所以这里Y其实是横向的
          // console.log(d );
        });

        // (2-3) 数据连接，根据id绑定数据
        var node = svg.selectAll("g.node").data(nodes, function(d) {
          return (
            d.id || (d.id = ++i) //最初新点开的节点都没有id
          ); //为没有id的节点添加上ID
        });

        var div = d3.select(".chartTooltip").style("opacity", 0);
        var timer = null;

        var nodeEnter = node
          .enter()
          .append("g")
          .attr("class", "node")
          .style("cursor", "pointer")
          .attr("transform", function(d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
            // 反方向 节点位置
            // return "translate(" + -source.y0 + "," + source.x0 + ")"
          })
          .on("mouseover", d => {
            if (timer) clearTimeout(timer);
            d3.select(".chartTooltip")
              .transition()
              .duration(300)
              .style("opacity", 1)
              .style("display", "block");
            // 从d3.event获取鼠标的位置
            var transform = d3.event;
            var yPosition = transform.layerY + 20;
            var xPosition = transform.layerX + 20;
            // 将浮层位置设置为鼠标位置
            var chartTooltip = d3
              .select(".chartTooltip")
              .style("left", xPosition + "px")
              .style("top", yPosition + "px");
            // 更新浮层内容
            chartTooltip.select(".name").text(d.label);
            // 移除浮层hidden样式，展示浮层
            chartTooltip.classed("hidden", false);
          })
          // 添加mouseover事件
          .on("mouseout", () => {
            // 添加浮层hidden样式，隐藏浮层
            timer = setTimeout(function() {
              d3.select(".chartTooltip")
                .style("opacity", 0)
                .style("display", "none");
              // d3.select('.chartTooltip').style('opacity', 0)
            }, 400);
          })
          .on("click", function(d) {
            click(d);
          });
        d3.select(".chartTooltip")
          .on("mouseover", function() {
            if (timer) clearTimeout(timer);
            d3.select(".chartTooltip")
              .transition()
              .duration(300)
              .style("opacity", 1)
              .style("display", "block");
          })
          .on("mouseout", function() {
            timer = setTimeout(function() {
              d3.select(".chartTooltip")
                .style("opacity", 0)
                .style("display", "none");
            }, 400);
          });

        // 原点
        nodeEnter
          .append("circle")
          .attr("r", 1e-6)
          .style("fill", function(d) {
            return d._children ? "#f00" : "#fff";
          });

        //文字
        nodeEnter
          .append("text")
          .attr("x", function(d) {
            return d.children || d._children ? 20 : 0;
          })
          .attr("y", function(d) {
            return d.children || d._children ? 25 : 20;
          })
          .attr("dy", ".35em")
          .attr("text-anchor", function(d) {
            return d.children || d._children ? "end" : "start";
          })
          .text(function(d) {
            return d.label;
          })
          .style("fill-opacity", 1)
          .style("font-size", "12px");

        // (2-5) 原有节点更新到新位置
        var nodeUpdate = node
          .transition()
          .duration(duration)
          .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
            // 反方向 节点更新
            // return "translate(" + -d.y + "," + d.x + ")";
          });

        nodeUpdate
          .select("circle")
          .attr("r", 4.5)
          .attr("r", function(d) {
            return d._children ? "5" : "5";
          })
          .style("fill", function(d) {
            return d._children ? "#f00" : "#f90";
          });
        nodeUpdate.select("text").style("fill-opacity", 1);

        // (2-6) 折叠节点的子节点收缩回来
        var nodeExit = node
          .exit()
          .transition()
          .duration(duration)
          .attr("transform", function(d) {
            return "translate(" + source.y + "," + source.x + ")";
            // 反方向 节点退出
            // return "translate(" + -source.y + "," + source.x + ")";
          })
          .remove();
        nodeExit.select("circle").attr("r", 1e-6);
        nodeExit.select("text").style("fill-opacity", 1);

        // (2-7) 数据连接，根据目标节点的id绑定数据
        var link = svg.selectAll("path.link").data(links, function(d) {
          return d.target.id;
        });

        // (2-8) 增加新连接
        link
          .enter()
          .insert("path", "g")
          .attr("class", "link")
          .attr("d", function(d) {
            var o = { x: source.x0, y: source.y0 };
            return diagonal({ source: o, target: o });
          });

        // (2-9) 原有连接更新位置
        link
          .transition()
          .duration(duration)
          .attr("d", diagonal);

        // (2-10) 折叠的链接，收缩到源节点处
        link
          .exit()
          .transition()
          .duration(duration)
          .attr("d", function(d) {
            var o = { x: source.x, y: source.y };
            return diagonal({ source: o, target: o });
          })
          .remove();
        // 把旧位置存下来，用以过渡
        nodes.forEach(function(d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      }

      // (3) 切换折叠与否
      function click(d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d); // 重新渲染
        // 点击节点 以当前节点位置居中
        const a = zoom.scale();
        svg.attr(
          "transform",
          "translate(" +
            (width / 3 - d.y0 * a) +
            ", " +
            (height / 2 - d.x0 * a) +
            ") scale(" +
            a +
            ")"
        );
        zoom.translate([width / 3 - d.y0 * a, height / 2 - d.x0 * a]).scale(a);
      }
    }
  }
};
</script>

<style>
.node {
  cursor: pointer;
}

.node circle {
  fill: none;
  stroke: #fff;
  stroke-width: 1.5px;
}

.node text {
  font: 10px sans-serif;
}

.link {
  fill: none;
  stroke: #ccc;
  stroke-width: 1.5px;
}

.link {
  fill: none;
  stroke: #ccc;
  stroke-width: 1.5px;
}

.tree {
  height: 100%;
  margin: 0 auto;
  background: #fff;
  box-sizing: border-box;
}

.tree svg {
  width: 100%;
  height: 100%;
}

.chartTooltip {
  position: absolute;
  width: 200px;
  height: auto;
  padding: 10px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.4);
}

.chartTooltip.hidden {
  display: none;
}

.chartTooltip p {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  word-wrap: break-word;
}

#tree {
  height: 500px;
}
</style>