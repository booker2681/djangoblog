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

function send_graph_data_for_demo(){
    // var level = $('#level').val();
    // $('#level_send_graph_data').attr('onclick', 'send_graph_data(' + '\'' + prisoner + '\'' + ')')
    // $("button").attr("disabled", true);

    console.log(level)

    $.ajax({
        url: "/get_graph_data_for_demo/",        
        dataType: "json",
        traditional: true, 
        data: {
            prisoner: '123',
        },
        type:"POST",

        success: function(data) {
            console.log(data)
            create_graph(data)
            $("#graph_card_div").show();
            $("#option_card_div").show();

            $("button").attr("disabled", false);
        },
        
        error:function() {
            $("button").attr("disabled", false);
        }
    });
}

function send_graph_data(prisoner){
    var level = $('#level').val();
    $('#level_send_graph_data').attr('onclick', 'send_graph_data(' + '\'' + prisoner + '\'' + ')')
    $("button").attr("disabled", true);

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
            console.log(data)
            create_graph(data)
            $("#graph_card_div").show();
            $("#option_card_div").show();

            $("button").attr("disabled", false);
        },
        
        error:function() {
            $("button").attr("disabled", false);
        }
    });
}

function create_graph(data){
    $('#graph').remove();
    $('#graph_div').append('<div id="graph"></div>');

    var map = data['Map']
    var links = data['Link']

    console.log(data)

    // var map=[
    //     {name:"小美"},
    //     {name:"小名"},
    // ];
    // // 宣告link
    // var links=[
    //     {source:0,
    //      target:1},
    // ];

    // 設定畫布(SVG)的長、寬
    var width = document.getElementById('search_card').offsetWidth-30
    var height = 600;
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
        .attr("stroke-width", 3.8)
        .attr("stroke","rgb(221, 221, 221)");
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
        .attr("r", 17) // 圓大小　
        .attr("fill", function(d,i) { return color(i); })
        .attr('stroke','white')
        .attr('stroke-width',4) // 外圓寬度
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    // 繪製文字
    link.on("click", function(d){
        // data example:
            // index: 11
            // source: {name: "吳淑珍", index: 3, x: 815.7180027407591, y: 394.3150093427693, vy: 0.000023567610047150555, …}
            // target: {name: "黃睿靚", index: 2, x: 703.3032211246168, y: 205.691069188687, vy: -0.000026148494884777663, …}
            // verdict: ['最高法院 100.03.03.  一百年度臺抗字第128號刑事裁定', '最高法院 101.04.30. 一百零一年度臺抗字第360號刑事裁定']
            // weight: 2
        // html example:
            // <th scope="col">#</th>
            // <th scope="col">裁判字號</th>
            // <th scope="col">案由</th>
            // <th scope="col">法院</th>
            // <th scope="col">判決種類</th>
        

        console.log(d);
        $('#verdict_modal_title').html('<h2 id="verdict_modal_title">' + d['source']['name'] + '與' + d['target']['name'] + '</h2>') 
        $('#verdict_modal').modal('show')
        $("#verdict_modal_table_row").show()
        $('#verdict_modal_title').show()
        $("#verdict_modal_p_judgement").hide()
        $("#verdict_modal_p_no").hide()
        $("#verdict_modal_p_reason").hide()
        $("#verdict_modal_p_sys").hide()
        $("#verdict_modal_p_date").hide()
        $("#verdict_modal_p_court").hide()
        $("#modal_back_btn").hide()
        $('#verdict_modal_tbody').remove();
        $('#verdict_modal_table').append("<tbody id='verdict_modal_tbody'></tbody>")

        for(i = 0; i<d['v_id'].length ; i++){
            $('#verdict_modal_tbody').append('<tr><th scope="row">' + (i+1) + '</th><td>' + d['no'][i] + '</td><td>' + d['reason'][i] + '</td><td>' + d['court'][i] + '</td><td>' + d['type'][i] + '</td><td><button type="button" class="btn btn-dark" onclick="get_verdict(' + '\'' + d['v_id'][i] + '\'' + ')">查看判決書</button></td></tr>');
        }
         // here you can access data of node using d.key 
        // alert("You clicked on node " + d.name);
      });
    node.on("dblclick", function(d){
        // data example:
            // court: (3) ["臺灣臺北地方法院", "臺灣高等法院", "最高法院"]
            // date: (3) ["2016-03-16T00:00:00+08:00", "2016-06-17T00:00:00+08:00", "2016-08-17T00:00:00+08:00"]
            // index: 20
            // name: "黃雅珏"
            // no: (3) ["105,附民,64", "105,附民上,22", "105,台附,11"]
            // reason: (3) ["附帶民訴", "刑事附帶民事訴訟", "聲請交付審判附帶民事訴訟"]
            // sys: (3) ["刑事", "刑事", "刑事"]
            // type: (3) ["判決", "判決", "判決"]
            // verdict: (3) ["5d30db9acbd1c48dc979dd80", "5d30e001cbd1c48dc99264fe", "5d30e1f1cbd1c48dc99a3b39"]
        // html example:
            // <th scope="col">#</th>
            // <th scope="col">裁判字號</th>
            // <th scope="col">案由</th>
            // <th scope="col">法院</th>
            // <th scope="col">判決種類</th>

        console.log(d);
        $('#verdict_modal_title').html('<h2 id="verdict_modal_title">' + d['name'] + '</h2>') 
        $('#verdict_modal').modal('show')
        $("#verdict_modal_table_row").show()
        $('#verdict_modal_title').show()
        $("#verdict_modal_p_judgement").hide()
        $("#verdict_modal_p_no").hide()
        $("#verdict_modal_p_reason").hide()
        $("#verdict_modal_p_sys").hide()
        $("#verdict_modal_p_date").hide()
        $("#verdict_modal_p_court").hide()
        $("#modal_back_btn").hide()
        $('#verdict_modal_tbody').remove();
        $('#verdict_modal_table').append("<tbody id='verdict_modal_tbody'></tbody>")

        for(i = 0; i<d['v_id'].length ; i++){
            $('#verdict_modal_tbody').append('<tr><th scope="row">' + (i+1) + '</th><td>' + d['no'][i] + '</td><td>' + d['reason'][i] + '</td><td>' + d['court'][i] + '</td><td>' + d['type'][i] + '</td><td><button type="button" class="btn btn-dark" onclick="get_verdict(' + '\'' + d['v_id'][i] + '\'' + ')">查看判決書</button></td></tr>');
        }
         // here you can access data of node using d.key 
        // alert("You clicked on node " + d.name);
      });
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
        .distance(180);

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
        d.fx = d.fx;
        d.fy = d.fy;
    }
}

function find_path(){
    var source = $('#source').val();
    var target = $('#target').val();
    $("button").attr("disabled", true);

    console.log(source, target)

    $.ajax({
        url: "/get_shortest_path/",        
        dataType: "json",
        traditional: true, 
        data: {
            source: source,
            target: target,
        },
        type:"POST",

        success: function(data) {
            console.log(data)
            create_graph(data)
            $("#graph_card_div").show();

            $("button").attr("disabled", false);
        },
        
        error:function() {
            $("button").attr("disabled", false);
        }
    });
}

function get_verdict(verdict){
    console.log(verdict)

    // <h2 id="verdict_modal_p_no"></h2>
    // <h3 id="verdict_modal_p_reason"></h3>
    // <h3 id="verdict_modal_p_sys"></h3>
    // <h3 id="verdict_modal_p_date"></h3>
    // <h3 id="verdict_modal_p_court"></h3>
    // <p id='verdict_modal_p_judgement'></p>

    $.ajax({
        url: "/get_verdict/",        
        dataType: "json",
        traditional: true, 
        data: {
            verdict: verdict,
        },
        type:"POST",

        success: function(data) {
            console.log(data)
            // $('#verdict_modal').modal('hide')
            $("#verdict_modal_table_row").hide()
            $('#verdict_modal_title').hide()
            $("#verdict_modal_p_judgement").show()
            $("#verdict_modal_p_no").show()
            $("#verdict_modal_p_reason").show()
            $("#verdict_modal_p_sys").show()
            $("#verdict_modal_p_date").show()
            $("#verdict_modal_p_court").show()
            $("#modal_back_btn").show()
            $("#verdict_modal_p_judgement").html(data['judgement'])
            $("#verdict_modal_p_no").html("裁判字號: " + data['no'])
            $("#verdict_modal_p_reason").html("案由: " + data['reason'])
            $("#verdict_modal_p_sys").html("判決種類: " + data['sys'])
            $("#verdict_modal_p_date").html("日期: " + data['date'])
            $("#verdict_modal_p_court").html("法院: " + data['court'])
        },
        
        error:function() {
        }
    });
}

function modal_back(){
    $("#verdict_modal_table_row").show()
    $('#verdict_modal_title').show()
    $("#verdict_modal_p_judgement").hide()
    $("#verdict_modal_p_no").hide()
    $("#verdict_modal_p_reason").hide()
    $("#verdict_modal_p_sys").hide()
    $("#verdict_modal_p_date").hide()
    $("#verdict_modal_p_court").hide()
    $("#modal_back_btn").hide()
}

// $('#verdict_modal').on('hide.bs.modal', function (e) {
//     $("#verdict_modal_table_row").show()
//     $('#verdict_modal_title').show()
//     $("#verdict_modal_p_judgement").hide()
//     $("#verdict_modal_p_no").hide()
//     $("#verdict_modal_p_reason").hide()
//     $("#verdict_modal_p_sys").hide()
//     $("#verdict_modal_p_date").hide()
//     $("#verdict_modal_p_court").hide()
//     $("#modal_back_btn").hide()
//     // do something...
//   })

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