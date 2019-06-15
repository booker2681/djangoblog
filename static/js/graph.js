function search_prisoner(){
    $("#search_btn").attr("disabled", true);
    var prisoner = $('#prisoner').val();

    console.log(prisoner)

    $.ajax({
        url: "/search_prisoner/",        
        dataType: "json",
        traditional: true, 
        data: {
            prisoner: prisoner,
        },
        type:"POST",

        success: function(data) {
            $('#prisoner_tbody').remove();
            $('#prisoner_table').append("<tbody id='prisoner_tbody'></tbody>")

            $("#prisoner_card_div").show();
            for(i = 0; i<data['prisoner'].length ; i++){
                $('#prisoner_tbody').append('<tr><th scope="row">' + (i+1) + '</th><td>' + data['prisoner'][i] + '</td><td><button type="button" class="btn btn-dark" onclick="send_graph_data(' + '\'' + data['prisoner'][i] + '\'' + ')">查詢網路</button></td></tr>');
            }
            console.log(data)

            $("#search_btn").attr("disabled", false);
        },
        
        error:function() {
            $("#search_btn").attr("disabled", false);
        }
    });
}  

function send_graph_data(prisoner){
    var level = $('#level').val();
    console.log(level)

    $.ajax({
        url: "/get_graph_data/",        
        dataType: "json",
        traditional: true, 
        data: {
            prisoner: prisoner,
            level: level,
        },
        type:"POST",

        success: function(data) {
            create_graph()
            $("#graph_card_div").show();
            $("#option_card_div").show();
        },
        
        error:function() {
        }
    });
}

function create_graph(){
    $('#graph').remove();
    $('#graph_div').append('<div id="graph"></div>');

    var map=[
        {name:"小美"},
        {name:"小名"},
        {name:"阿夜"},
        {name:"大日"},
        {name:"老鼠"},
        {name:"蝦米"},
        {name:"大象"},
        {name:"麥稈"},

    ];
    // 宣告link
    var links=[
        {source:0,
         target:1},
        {source:0,
         target:5},
        {source:1,
         target:2},
        {source:1,
         target:3},
        {source:2,
         target:4},
        {source:2,
        target:6},
        {source:7,
        target:3},
    ];
    // 設定畫布(SVG)的長、寬
    var width = document.getElementById('search_card').offsetWidth-30
    var height = 450;
    // 設定顏色 使用d3內建的顏色 Category20有20種顏色 使用RGB十六進位表示
    var color = d3.scaleOrdinal()
        .range(d3.schemeCategory20);
    // 設定畫布(SVG)
    var svg = d3.select("div#graph").append("svg")
        .attr("width", width)
        .attr("height", height)
    // d3中的力學模擬器 link:連結的引力 charge:點之間的引力 center:引力的中心
    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink())
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));
    // 繪製線 
    var link = svg.append("g")
        // 繪製類別 - 線
        .attr("class", "links")
        // 線 用line元素來繪製
        .selectAll("line")
        // 讀取資料
        .data(links)
        .enter().append("line")
        // 線的寬度跟樣式
        .attr("stroke-width", 2)
        .attr("stroke","black");
    // 繪製點
    var node = svg.append("g")
        // 繪製類別 - 點
        .attr("class", "nodes")
        // 繪成圓形
        .selectAll("circle")
        // 讀取資料
        .data(map)
        .enter().append("circle")
        // 圓的寬度與樣式
        .attr("r", 12)
        .attr("fill", function(d,i) { return color(i); })
        .attr('stroke','white')
        .attr('stroke-width',2)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    // 繪製文字
    var text = svg.selectAll("text")
        // 讀取資料
         .data(map)
         .enter()
         .append("text")
         // 文字的樣式
         .style("fill", "black")
         .attr("dx", 12)
         .attr("dy", 5)
         .text(function(d){
            return d.name;
         });
    // 將模擬器綁定節點、線、文字
    simulation
        .nodes(map) //產生index,vx,xy,x,y數值來做視覺化
        .on("tick", ticked);  //tick為模擬器的計時器，用來監聽綁定後數據的改變

    simulation.force("link")
        .links(links)
        .distance(50);

    simulation.force("charge")
        .strength(-60)
    // 定義ticked()，用來當tick發現數據改變時，要做的動作
    function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    text
        .attr("x", function(d) { return d.x;})
        .attr("y", function(d) { return d.y;});
    };
    // 定義拖拉的動作，因為在拖拉的過程中，會中斷模擬器，所以利用restart來重啟
    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    // 定義拖曳中的動作
    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }
    // 定義拖曳結束的動作
    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

// chart.js
// function create_predict_trend(data, type){
//     $('#' + type + '_line').remove(); // this is my <canvas> element
//     $('#' + type + '_line_div').append('<canvas id="' + type + '_line"><canvas>');

//     var ctx = document.getElementById(type + '_line');
//     // console.log(data)
//     // console.log(type)
//     console.log(data[type])
//     console.log(ctx)


//     var myChart = new Chart(ctx, {
//             type: 'bar',

//             data: {
//                 datasets: data[type],
//             },
//             options: {
//                 legend: {
//                     display: true,
//                     position: 'bottom',

//                     labels: {
//                         fontColor: '#71748d',
//                         fontFamily: 'Circular Std Book',
//                         fontSize: 14,
//                     }
//                 },

//                 scales: {
//                     xAxes: [{
//                         ticks: {
//                             fontSize: 14,
//                             fontFamily: 'Circular Std Book',
//                             fontColor: '#71748d',
//                         }
//                     }],
//                     yAxes: [{
//                         ticks: {
//                             fontSize: 14,
//                             fontFamily: 'Circular Std Book',
//                             fontColor: '#71748d',
//                         },
//                         scaleLabel: {
//                             display: true,
//                             labelString: '萬元'
//                         }
//                     }]
//                 }
//             }
        


//     });

// }