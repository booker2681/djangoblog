function send_data(){
    var s_obj = document.getElementsByName("s");
    var a_obj = document.getElementsByName("a");
    var s_selected = [];
    var a_selected = [];
    for (var i=0; i<s_obj.length; i++) {
        if (s_obj[i].checked) {
                s_selected.push(s_obj[i].value);
            }
    }
    for (var i=0; i<a_obj.length; i++) {
        if (a_obj[i].checked) {
                a_selected.push(a_obj[i].value);
            }
    }

    $.ajax({
        url: "/get_trend/",        
        dataType: "json",
        traditional: true, 
        data: {
            'season': s_selected,
            'area': a_selected,
        },
        type:"POST",

        success: function(data) {
            create_bar_trend(data, 'total_count')
            create_price_trend(data, 'mean_total_price')
            create_price_trend(data, 'mean_unit_price')
            create_area_trend(data, 'mean_area')
            create_area_trend(data, 'mean_building_area')
            create_radar_trend(data['season_main_use_rate'], 'main_use_rate')
            
            console.log(data['season_main_use_rate'])
            console.log(data)
            $(".trend").show();
        },
        
        error:function() {
        }
    });
};    

function area_all(obj, cName){
    var checkboxs = document.getElementsByName(cName); 
    for(var i=0;i<checkboxs.length;i++){
        checkboxs[i].checked = obj.checked;
    } 
}

function create_price_trend(data, type){
    $('#' + type + '_line').remove(); // this is my <canvas> element
    $('#' + type + '_line_div').append('<canvas id="' + type + '_line"><canvas>');

    var ctx = document.getElementById(type + '_line');
    // console.log(data)
    // console.log(type)
    // console.log(data['area_' + type])


    var myChart = new Chart(ctx, {
            type: 'line',

            data: {
                labels: data['season'],
                datasets: data['area_' + type],
            },
            options: {
                legend: {
                    display: true,
                    position: 'bottom',

                    labels: {
                        fontColor: '#71748d',
                        fontFamily: 'Circular Std Book',
                        fontSize: 14,
                    }
                },

                scales: {
                    xAxes: [{
                        ticks: {
                            fontSize: 14,
                            fontFamily: 'Circular Std Book',
                            fontColor: '#71748d',
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            fontSize: 14,
                            fontFamily: 'Circular Std Book',
                            fontColor: '#71748d',
                        },
                        scaleLabel: {
                            display: true,
                            labelString: '萬元'
                        }
                    }]
                }
            }
        


    });

}

function create_area_trend(data, type){
    $('#' + type + '_line').remove(); // this is my <canvas> element
    $('#' + type + '_line_div').append('<canvas id="' + type + '_line"><canvas>');

    var ctx = document.getElementById(type + '_line');
    // console.log(data)
    // console.log(type)
    // console.log(data['area_' + type])


    var myChart = new Chart(ctx, {
            type: 'line',

            data: {
                labels: data['season'],
                datasets: data['area_' + type],
            },
            options: {
                legend: {
                    display: true,
                    position: 'bottom',

                    labels: {
                        fontColor: '#71748d',
                        fontFamily: 'Circular Std Book',
                        fontSize: 14,
                    }
                },

                scales: {
                    xAxes: [{
                        ticks: {
                            fontSize: 14,
                            fontFamily: 'Circular Std Book',
                            fontColor: '#71748d',
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            fontSize: 14,
                            fontFamily: 'Circular Std Book',
                            fontColor: '#71748d',
                        },
                        scaleLabel: {
                            display: true,
                            labelString: '坪數'
                        }
                    }]
                }
            }
        


    });

}

function create_bar_trend(data, type){
    $('#' + type + '_line').remove(); // this is my <canvas> element
    $('#' + type + '_line_div').append('<canvas id="' + type + '_line"><canvas>');

    var ctx = document.getElementById(type + '_line');
    // console.log(data)
    // console.log(type)
    // console.log(data['area_' + type])


    var myChart = new Chart(ctx, {
            type: 'bar',

            data: {
                labels: data['season'],
                datasets: data['area_' + type],
            },
            options: {
                legend: {
                    display: true,
                    position: 'bottom',

                    labels: {
                        fontColor: '#71748d',
                        fontFamily: 'Circular Std Book',
                        fontSize: 14,
                    }
                },

                scales: {
                    xAxes: [{
                        ticks: {
                            fontSize: 14,
                            fontFamily: 'Circular Std Book',
                            fontColor: '#71748d',
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            fontSize: 14,
                            fontFamily: 'Circular Std Book',
                            fontColor: '#71748d',
                        },
                        scaleLabel: {
                            display: true,
                            labelString: '筆數'
                        }
                    }]
                }
            }
        


    });

}

function create_radar_trend(data, type){
    $('#' + type ).remove(); // this is my <canvas> element
    $('#' + type + '_div').append('<canvas id="' + type + '"><canvas>');

    var ctx = document.getElementById(type);
    console.log(data)
    // console.log(type)
    // console.log(data['area_' + type])


    var myChart = new Chart(ctx, {
            type: 'radar',
            data: data,
    });

}

        


