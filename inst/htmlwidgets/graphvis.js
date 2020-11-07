HTMLWidgets.widget({

  name: 'graphvis',

  type: 'output',

  factory: function(el, width, height) {
    
    // TODO: define shared variables for this instance
    
    var svg = d3.select(el).append("svg")
            .attr("width",width)
            .attr("height",height)
            .attr('id', 'svg')
            .style('background', '#F5F5F5');
            
    
    return {

      renderValue: function(x) {

        // TODO: code to render the widget, e.g.
        // el.innerText = 'hello there!';
        // el.classList.add("svg");
        
        // 加载 节点数据、边数据
        
        var links = HTMLWidgets.dataframeToD3(x.links);
        var nodes = HTMLWidgets.dataframeToD3(x.nodes);
        
        
        let linkMap = {};
        linkMap = genLinkMap(links);
        
        // 创建画布
        /*
        var width = 680;
        var height = 800;
        var svg = d3.select(el).append("svg")
            .attr("width",width)
            .attr("height",height)
            .attr('id', 'svg')
            .style('background', '#F5F5F5');
        */
        
        var circle_radius = 30;
        
        // 力导向布局
        simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(200)) //节点之间的距离
            .force("charge",d3.forceManyBody().strength(-150)) // 力的大小
            .force("center",d3.forceCenter(width/2, height/2)); // 中心位置
        
        
        // 尺度函数，将节点的度映射为圆的半径
        var linear = d3.scaleLinear()
            .domain([0,30])
            .range([30,40]);
    
        // 绘制连接线
        index = ['用于','用到','衍生','基础','替代','等同'];
        colour1 = ['#5b8ff9', '#5ad8a6', '#5d7092', '#f6bd16', '#e8684a', '#6dc8ec'];
        var colorline = d3.scaleOrdinal()
            .domain(index)
            .range(colour1);
        
        var svg_links = svg.selectAll("path")
            .data(links)
            .enter()
            .append("path")
            .attr('id', d => 'link-' + d.id)
            .style("stroke",d => colorline(d.rela))
            .style("stroke-width",1);
        
        const lineText = svg.append('g').selectAll('.linetext')
            .data(links)
            .enter()
            .append('text')
            .attr('id', d => 'linetext' + d.id)
            .attr('calss', 'linktext')
            .attr('fill', '#000000')
            //.attr('dx', d => getLineTextDx(d))
            .attr('dx', 0)
            .attr('dy', 5)
            .style('font-size', '9px')
            //.attr('font-weight', 'bold')
            .style('font-family', 'Microsoft YaHei')
            .style('text-shadow', '0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff');
        
        
        lineText.append('textPath')
            .attr('xlink:href', d => '#link-' + d.id)
            .attr('startOffset', '50%') // textPath 的startOffset属性能够定义文本位置
            .text(d => d.rela);
        
        
        //绘制节点
        var index = ['通用技术', '专用技术'];
        var colour = ['#0084FF', '#FF4E00'];
      
        var color = d3.scaleOrdinal() // 根据节点类型着色
                .domain(index)
                .range(colour);
        
        var colour1 = ['rgba(0,132,255,0.5)', 'rgba(255,78,0,0.5)'];
        
        var colorstroke = d3.scaleOrdinal() // 对接点边缘着色， 添加0.5透明度
                .domain(index)
                .range(colour1);
    
        var svg_nodes = svg.selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr('id', d => d.id)
            .attr("r", d => linear(d.value))
            .attr("fill",d => color(d.group))
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
            
        svg_nodes.append('title') //hangon显示标签名称
            .text(d => d.name);
    
        function dragstarted(d) {
            if (!d3.event.active)
                simulation.alphaTarget(0.002).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }
        function dragended(d) {
            if (!d3.event.active)
                simulation.alphaTarget(0);
        }
    
        //节点标签
        var svg_text = svg.selectAll('.nodetext')
            .data(nodes)
            .enter()
            .append("text")
            .attr('class', 'nodetext')
            .attr('id', d => 'node' + d.id)
            .style("fill","#FFFFFF")
            .style('pointer-events', 'none') // 点击事件穿透上层元素
            .attr('font-size', '10px')
            .attr('font-family', 'Microsoft YaHei')
            .attr('font-weight', 'bold')
            .attr("dominant-baseline","middle") 
            //.attr("text-anchor", "middle")
            .attr('x',function ({name}) {
                return textBreaking(d3.select(this), name);
            });
            
            function textBreaking(d3text, text) {
                //将长文本分别放置在3个tspan中，实现换行
                const len = text.length;
                if (len <= 4) {
                    d3text.append('tspan')
                        .attr('dx', '0em')
                        .attr('dy', '0em')
                        .text(text);
                } else {
                    const topText = text.substring(0, 4);
                    const midText = text.substring(4, 9);
                    let botText = text.substring(9, len);
                    if (len <= 13) {
                        
                    } else {
                        botText = text.substring(9, 13) + '...';
                    }
    
                    d3text.text('');
                    d3text.append('tspan')
                        .attr('dx',-5 * 4) // 根据字符大小计算水平方向上居中
                        .attr('dy', '-1.1em')
                        .text(function () {
                            return topText;
                        });
                    d3text.append('tspan')
    
                        .attr('dx', - (midText.length * 5 + 4 * 5))
                        .attr('dy', '1.1em')
                        .text(function () {
                            return midText;
                        });
                    d3text.append('tspan')
                        .attr('dx', - (Math.min(botText.length, 5) * 5 + 5 * 5))
                        .attr('dy', '1.1em')
                        .text(function () {
                            return botText;
                        });
                }
            }
    
        //箭头
        var marker= svg.selectAll('marker')
                .data(links)
                .enter()
                .append("marker")
                .attr("id", d => d.type)
                .attr("markerUnits","userSpaceOnUse")
                .attr("viewBox", "0 -5 10 10")//坐标系的区域
                .attr("refX",d => linear(d.tvalue) + 8)//箭头坐标,根据节点大小
                .attr("refY", 0)
                .attr("markerWidth", 9)//标识的大小
                .attr("markerHeight", 9)
                .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
                .attr("stroke-width",2)//箭头宽度
                .append("path")
                .attr("d", "M0,-5L10,0L0,5")//箭头的路径
                .attr('fill', d => colorline(d.rela));//箭头颜色
        
        function draw(){
            svg_nodes
                .attr("cx",function(d){return d.x;})
                .attr("cy",function(d){return d.y;})
                .attr("role",function (d) {
                    return d.role;
                });
            
            svg_text
                .attr("x", function(d){ return d.x; })
                .attr("y", function(d){ return d.y; });
            
            svg_links
                .attr("d",function(d){
                    return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;
                })
                .attr("marker-end", "url(#resolved)");
            
            lineText
                .attr("x", function(d){ return d.x; })
                .attr("y", function(d){ return d.y; });
                
        }
        simulation.on("tick",draw);
      
    
        // zoom事件
        svg.call(d3.zoom().scaleExtent([0.05, 8]).on('zoom', () => {
            var transform = d3.event.transform;
            svg_nodes.attr('transform', transform);
            svg_links.attr("transform",transform);
            svg_text.attr("transform",transform);
            //lineText.attr('transform', transform);
        })).on('dblclick.zoom', null);
        
    
        // 节点事件 :  高亮隐藏节点
        function toggleNode(nodeCircle, currNode, isClick, isHover){
          
          // 点击节点
          if(isClick){
              console.log(currNode);
              //提升节点层级
              nodeCircle.sort((a,b) => a.id === currNode.id ? 1: -1);
              nodeCircle
                  .style('opacity', 0.1)
                  .filter(node => isLinkNode(currNode, node))
                  .style('opacity', 1)
                  .style('stroke', node => colorstroke(node.group))
                  .style('stroke-width', 8);
          } else {
              nodeCircle
                  .style('opacity', 1)
                  .style('stroke-width', 0);
          }
          
          // 悬浮节点
          if (! isHover){
              return;
          }
  
  
          if(isHover){
              //提升节点层级
              nodeCircle.sort((a,b) => a.id === currNode.id ? 1: -1);
              nodeCircle
                  .filter(node => isLinkNode(currNode, node))
                  .style('stroke', node => colorstroke(node.group))
                  .style('stroke-width', 8);
          } else {
              nodeCircle
                  .style('opacity', 1)
                  .style('stroke-width', 0);
          }
          
        }
      
        
        
        function isLinkNode(currNode, node){
            if (currNode.id == node.id){
                return true;
            } else {
                return linkMap[currNode.id + '-' + node.id] || linkMap[node.id + '-' + currNode.id];
            }
        }
    
        function genLinkMap(links){
    
            const hash = {};
            links.map(function({
                source,
                target,
                rela
            }){
                const key = source + '-' + target;
                if (hash[key]){
                    hash[key] += 1;
                    hash[key + '-label']  += '、' + rela;
                } else {
                    hash[key] = 1;
                    hash[key + '-lable'] = rela;
                }
            });
            return hash;
    
        }
    
    
        // 节点事件 : 高亮隐藏节点标签
        function toggleNodeText(nodeText, currNode, isClick, isHover){

          // 点击节点
          if(isClick){
              //提升节点层级
              nodeText.sort((a,b) => a.id === currNode.id ? 1: -1);
              nodeText
                  .style('opacity', 0.1)
                  .filter(node => isLinkNode(currNode, node))
                  .style('opacity', 1);
          } else {
              nodeText.style('opacity', 1);
          }
  
          // 悬浮节点
          if (! isHover){
              return;
          }
  
          // 悬浮节点
          if(isHover){
              //提升节点层级
              nodeText.sort((a,b) => a.id === currNode.id ? 1: -1);
              nodeText
                  .filter(node => isLinkNode(currNode, node));
          } else {
              nodeText.style('opacity', 1);
          }
  
        }
        
        
        // 节点事件 :  高亮隐藏连线
        function toggleLine(linkLine, currNode, isClick, isHover) {

          // 点击节点
          if (isClick) {
              //加重连线样式
              linkLine
                  .style('opacity', 0.1) // 透明度全部设置为0.1
                  .filter(link => isLinkLine(currNode, link)) // 筛选出连接线
                  .style('opacity', 1) // 将连接线的透明度设为1
                  .style('stroke-width', 1.5)
          } else {
              //连线恢复样式
              linkLine
                  .style('opacity', 1)
                  .style('stroke-width', 1);
          }
          
          // 悬浮节点
          if (! isHover){
              return;
          }
  
          if (isHover) {
              linkLine
                  .filter(link => isLinkLine(currNode, link)) 
                  .style('stroke-width', 1.5)
          } else {
              linkLine
                  .style('stroke-width', 1);
          };
  
        }
    
    
        function isLinkLine(node , link){
            return link.source.id == node.id || link.target.id == node.id;
        }
    
        // 节点事件 : 高亮隐藏线段标签
        function  toggleLineText(lineText, currNode, isClick, isHover){

          // 点击事件
          if (isClick) {
              lineText
                  .style('fill-opacity', link => isLinkLine(currNode, link) ? 1.0 : 0)
                  .style('font-size', '10px')
                  //.attr('font-weight', 'bold')
          } else {
              lineText
                  .style('fill-opacity', '1.0')
                  .style('font-size', '9px')
                  //.attr('font-weight', 'normal')
          }
  
          // 悬浮事件
          if (! isHover){
              return;
          }
  
          if (isHover) {
              lineText
                  .filter(link => isLinkLine(currNode, link))
                  .style('font-size', '10px')
          } else {
              lineText
                  .style('font-size', '9px')
          }
        }
    
        // 节点事件 : 高亮隐藏箭头
        function toggleMarker(marker, currNode, isClick, isHover){
        
          // 点击事件
          if (isClick) {
              // 放大箭头
              marker.filter(link => isLinkLine(currNode, link))
                  .style('transform', 'sacle(1.5)')
          } else {
              // 恢复箭头
              marker
                  .attr('refX', link => linear(link.tvalue))
                  .style('transform', 'sacle(1)')
          };
  
          // 悬浮事件
          if (! isHover){
              return;
          }
  
          if (isHover) {
              // 放大箭头
              marker.filter(link => isLinkLine(currNode, link))
                  .style('transform', 'sacle(1.5)')
          } else {
              // 恢复箭头
              marker
                  .attr('refX', link => linear(link.tvalue))
                  .style('transform', 'sacle(1)')
  
          };
  
        }
    
        
        let draging = false;
        
        var clicked = false; // 当前是否有节点被选中
        
        
        //监听点击事件
        svg_nodes.on('click', function(currNode){
            // 点击节点触发
            if (draging){
                return;
            } else {
                if (legendclicked){ // 当前有图例选中时， click事件失效；
                    return;
                }
                toggleNode(svg_nodes, currNode, true, false);
                toggleLine(svg_links, currNode, true, false);
                toggleLineText(lineText, currNode, true, false);
                toggleMarker(marker, currNode, true, false);
                toggleNodeText(svg_text, currNode, true, false);
                clicked = true; // 修改节点选中状态
                
                if (HTMLWidgets.shinyMode) {
                    // shiny中通过监测input$clicked_node来更新复选框内容
                      Shiny.onInputChange('clicked_node',currNode.id); 
                  };
                
            }
        })
        
        document.addEventListener('click',(e)=>{
            if (e.target.id){
                if (e.target.id == 'svg'){
                    if (legendclicked){ // 当前有图例选中时， click事件失效；
                      return;
                    }
                    currNode = 'none';
                    toggleNode(svg_nodes, currNode, false, false);
                    toggleLine(svg_links, currNode, false, false);
                    toggleLineText(lineText, currNode, false, false);
                    toggleMarker(marker, currNode, false, false);
                    toggleNodeText(svg_text, currNode, false, false);
                    clicked = false; // 修改节点选中状态
                }
            }
        })
        
        
        // 监听鼠标悬浮事件
        svg_nodes.on('mouseenter', function(currNode){
            
            if (draging){
                return;
            } else {
                if (legendclicked){ // 当前有图例选中时， mouseenter和mouseleave失效；
                    return;
                }
                if (clicked){ //在节点被clicked状态下，mouseenter和mouseleave失效；
                    return;
                }
                toggleNode(svg_nodes, currNode, false, true);
                toggleLine(svg_links, currNode, false, true);
                toggleLineText(lineText, currNode, false, true);
                toggleMarker(marker, currNode, false, true);
                toggleNodeText(svg_text, currNode, false, true);
            }
          }).on('mouseleave', function(currNode){
            
            if (draging){
                return;
            } else {
                if (legendclicked){ // 当前有图例选中时， mouseenter和mouseleave失效；
                    return;
                }
                if (clicked){  //在节点被clicked状态下，mouseenter和mouseleave失效；
                    return;
                }
                toggleNode(svg_nodes, currNode, false, false);
                toggleLine(svg_links, currNode, false, false);
                toggleLineText(lineText, currNode, false, false);
                toggleMarker(marker, currNode, false, false);
                toggleNodeText(svg_text, currNode, false, false);
            }
        })
        
        
        
        // 通过shinyoninputchang传递给R
        // 这部分在 svg_nodes.on中统一定义
        
        /*if (HTMLWidgets.shinyMode) {
          
          svg_nodes.on('click', function(currNode){
            
            
            alert('点击传递被触发！');
            // shiny中通过监测input$clicked_node来更新复选框内容
            Shiny.onInputChange('clicked_node',currNode.id); 
            
          })
        };*/
        
        
        function simulateClick(elem /* Must be the element, not d3 selection */) {
          // 模拟点击事件
          var evt = document.createEvent("MouseEvents");
          evt.initMouseEvent(
              'click', /* type */
              true, /* canBubble */
              true, /* cancelable */
              window, /* view */
              0, /* detail */
              0, /* screenX */
              0, /* screenY */
              0, /* clientX */
              0, /* clientY */
              false, /* ctrlKey */
              false, /* altKey */
              false, /* shiftKey */
              false, /* metaKey */
              0, /* button */
              null); /* relatedTarget */
          elem.dispatchEvent(evt);
          }
        
        
        // 接受shiny app中复选框中传递的信息
        var init = true; //首次进入app，显示全部节点
        if (HTMLWidgets.shinyMode) {
          Shiny.addCustomMessageHandler("mymessage", function(message) {
            
            if (!init){
              simulateClick(document.getElementById(message));//模拟点击节点
            }
            init = false;
          });
        };
        
        
    //添加图例

    var legendData = [ 
        // 图例数据
        {
            'group' : '通用技术',
            'id' : 'legend1', 
            'clicked' : false // 存储当前legend的选中状态
        },
        {
            'group' : '专用技术',
            'id' : 'legend2',
            'clicked' : false 
        }
    ]

    var legend;
    addLegend();
 
    function addLegend() {
    
        // var width = 680;
        console.log(width);

        legend = svg.selectAll(".legend")
            .data(legendData)
            .enter().append("g")
            .attr('id', d => d.id)
            .attr("class", "legend")
            .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });
            
        legend.append("rect")
            .attr("x", function (d,i) {
                    return width - 80;
            })
            .attr("y", function (d,i) {
                    return 20+8*i;
            })
            .attr("width", 30)
            .attr("height", 12)
            .attr('rx', 4)
            .attr('ry', 4)
            .data(legendData)
            .style("fill", d => color(d.group));
        
        legend.append("text")
            .attr("x", width - 90)
            .attr("y", function (d,i) {
                return 20+8*i;
            })
            .data(legendData)
            .attr("dy", "1em")
            .style("text-anchor", "end")
            .text(d => d.group)
            .style('font-size', '10px')
            //.attr('font-weight', 'bold')
            .style('font-family', 'Microsoft YaHei')
            .style('text-shadow', '0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff');
        }; 
    
        // 图例事件
        var legendclicked = 0  // 当前是否有图例被选中

        var isSelectedLegend = function(legendx, currlegend){
            // 是否选中图例
            return currlegend.group == legendx.group
        }

        var isLegendNode = function(node,currlegend){
            // 是否图例相关节点
            return node.group == currlegend.group
        };

        var isLegendLinkLine = function(link, currlegend){
            // 是否图例相关节点对应的连线：隐藏时，只要相关既隐藏
            var source = nodes.filter(node => node.id == link.source.id);
            var target = nodes.filter(node => node.id == link.target.id);
            return source[0].group == currlegend.group || target[0].group == currlegend.group;
            
        }

        var isLegendLinkLine2 = function(link, currlegend){
            // 是否图例相关节点对应的连线， 恢复时，需考虑两端节点都不被隐藏
            var source = nodes.filter(node => node.id == link.source.id);
            var target = nodes.filter(node => node.id == link.target.id);
            return (source[0].group == currlegend.group || target[0].group == currlegend.group) & ! source[0].hidden & ! target[0].hidden;
            
        }

        legend.on('mouseenter', function(currlegend){
            // 鼠标悬浮时，图例添加透明度
            legend.filter(legendx => isSelectedLegend(legendx, currlegend))
                    .style('opacity', 0.8)
            }
            ).on('mouseleave', function(currlegend){
                legend.filter(legendx => isSelectedLegend(legendx, currlegend))
                    .style('opacity', 1)
            })
        
        var legendStatus = function(currlegend){
            // 获取选中图例状态
            legendx = legendData.filter( function(a){
                    return a.id == currlegend.id
                }
            );
            return legendx;
        }

        var changeLegendStatus = function(currlegend){
            // 图例相关事件
            
            if (clicked){ //当前有节点被点击， 图例事件失效
              return;
            }
            if (! legendStatus(currlegend)[0].clicked){

                //改变图例状态

                legend.filter(legendx => isSelectedLegend(legendx, currlegend))
                    .selectAll('rect').style('fill', 'rgb(204,204,204)')
                legend.filter(legendx => isSelectedLegend(legendx, currlegend))
                    .selectAll('text').style('fill', 'rgb(204,204,204)')
                
                // 改变节点状态
                svg_nodes.sort((a,b) => a.group === currlegend.group ? 1: -1);
                svg_nodes
                    .filter(node => isLegendNode(node, currlegend))
                    .style('opacity', 0.1);
                
                var len = nodes.length; 
                for (var i =0; i < len; i ++){
                    if (nodes[i].group == currlegend.group){
                        nodes[i]['hidden'] = true;
                    }
                }
                
                // 改变节点标签状态
                svg_text.sort((a,b) => a.group === currlegend.group ? 1: -1);
                svg_text
                    .filter(node => isLegendNode(node, currlegend))
                    .style('opacity', 0.1);


                // 改变线段状态
                svg_links
                    .filter(link => isLegendLinkLine(link, currlegend))
                    .style('opacity', 0.05);


                // 改变线段标签状态
                lineText
                    .filter(link => isLegendLinkLine(link, currlegend))
                    .style('opacity', 0.05);
                
                legendStatus(currlegend)[0].clicked = true;
                legendclicked = legendclicked + 1;
                // alert(legendclicked);

            }else{


                // 改变图例状态（恢复）
                legend.filter(legendx => isSelectedLegend(legendx, currlegend))
                    .selectAll('rect').style('fill', d => color(d.group))
                legend.filter(legendx => isSelectedLegend(legendx, currlegend))
                    .selectAll('text').style('fill', 'rgb(0,0,0)')
                
                //改变节点状态（恢复）
                svg_nodes
                    .filter(node => isLegendNode(node, currlegend))
                    .style('opacity', 1);
                
                var len = nodes.length;
                for (var i = 0; i < len; i ++){
                    if (nodes[i].group == currlegend.group){
                        nodes[i]['hidden'] = false;
                    }
                };
                

                // 改变节点标签状态（恢复）
                svg_text
                    .filter(node => isLegendNode(node, currlegend))
                    .style('opacity', 1);
                
                // 改变线段状态（恢复）
                svg_links
                    .filter(link => isLegendLinkLine2(link, currlegend))
                    .style('opacity', 1);


                // 改变线段标签状态（恢复）
                lineText
                    .filter(link => isLegendLinkLine2(link, currlegend))
                    .style('opacity', 1);


                legendStatus(currlegend)[0].clicked = false;
                legendclicked = legendclicked - 1;
                

            } 
        }

        // 监听点击事件
        legend.on('click', function(currlegend){
            changeLegendStatus(currlegend);
            }  
        )
        
      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size
        // svg随 width 和 height 变化 
        d3.select(el).select('svg')
          .attr('width', width)
          .attr('height', height);
        
        // rect 位置 随 width 变化
        d3.selectAll("rect")
            .attr("x", function (d,i) {
                    return width - 80;
            })
        
        // 图例文本随 width 变化
        d3.selectAll(".legend").selectAll("text")
            .attr("x", width - 90)
          
        
        //simulation.resize([width, height]).resume();

      }

    };
  }
});