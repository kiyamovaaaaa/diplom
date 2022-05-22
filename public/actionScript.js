
thisUrl = window.location.href; // текущий адрес
hostURL = thisUrl.substr(0,thisUrl.indexOf("/",8)+1); //адресс хоста
month_rus = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
stanok_name = {
    "Fanuc_0i": "DOOSAN DNM6700",
    "Fanuc_160ii": "LVD IMPULS 6020",
    "Fanuc18i": "MAG 1050",
    "DUS400_Sinumerik 840Sl": "Станок токарный VDF 400 DUS"
};
let dateItems;

//====================================================================================================
//                                      запросы                                                     //
//====================================================================================================

function queryHistoryTable(startDate, endDate){
    modalWindow(true);
    date_param = "?startDate=" + startDate + "&endDate=" + endDate;
    var xhttp = new XMLHttpRequest();
    xhttp.addEventListener("load", function() {
        if (xhttp.status === 200) {
            result = JSON.parse(xhttp.response);
            items = result;
            reCreateTable(items);
            console.log(items);
        } else {
            console.log(xhttp);
            document.getElementById("err").innerHTML = "Ошибка запроса";
        }
    });
    xhttp.open("GET", hostURL + "historyTable" + date_param);
    xhttp.send();
}

function current_query(){
    modalWindow(true);
    // date_param = "?date=" + date;
    var xhttp = new XMLHttpRequest();
    xhttp.addEventListener("load", function() {
        if (xhttp.status === 200) {
            result = JSON.parse(xhttp.response);
            items = result;
            reCreateTable_current(items);
            checkSelectedCalendar();
            console.log(items);
        } else {
            console.log(xhttp);
        }
    });
    xhttp.open("GET", hostURL + "currentTableDate");
    xhttp.send();
}

//====================================================================================================
//                                  реконструкция страницы                                          //
//====================================================================================================

function reCreateTable(data_set) {
    while (document.getElementById("main_table").firstChild) {
        document.getElementById("main_table").firstChild.remove()
    }
    let table = document.querySelector('#main_table');

    now = new Date();

    day = now.getDate(); 
    month = now.getMonth(); 
    year = now.getFullYear();

    // update_hour = updateTime.getHours(); 
    // update_minute = updateTime.getMinutes(); 
    // update_second = updateTime.getSeconds();

    header_text = ["Название станка", "Выполненные УП", "Время работы", "Время простоя", "Выключен"];
    header_name = ["device_2", "Выполненные УП" , "work", "downtime", "off"];

    items = data_set;
    for(i=-1; i < items.length; i++) {  
        let tr = document.createElement('tr');
        for(j=0; j < header_name.length; j++) {  
            if(i == -1) { 
                let th = document.createElement('th');
                th.innerHTML = header_text[j];
                if(j == 0) th.style.borderTopLeftRadius = "20px";
                if(j == header_name.length - 1) th.style.borderTopRightRadius = "20px";
                tr.appendChild(th);
            } 
            else { 
                let td = document.createElement('td');
                if(i == items.length - 1) {
                    if(j == 0) td.style.borderBottomLeftRadius = "20px";
                    if(j == header_name.length - 1) td.style.borderBottomRightRadius = "20px";
                }
                if(header_name[j] == "device_2" || header_name[j] == "Выполненные УП") { 
                    if(header_name[j] == "device_2") {  
                        td.innerHTML = stanok_name[items[i][header_name[j]]] ;
                    } 
                    else {
                        td.innerHTML = items[i][header_name[j]] ;
                    }
                }
                else { 
                    h = Math.floor(items[i][header_name[j]] / 60);
                    m = Math.floor(items[i][header_name[j]] - (h * 60));
                    td.innerHTML = returnCasesHours(h) + " " + returnCasesMinutes(m);
                    if(td.innerHTML.replace(/\s/g, '') == "") td.innerHTML = "0 минут";
                    td.style.backgroundColor = header_name[j] == "downtime" ? "#FF5F5F" : ( header_name[j] == "repair" ? "#fbec64" : (header_name[j] == "work" ? "#35EC73" : "#EAEAEA") );
                }
                tr.appendChild(td);
            } 
        }
        table.appendChild(tr);
    }
    
    modalWindow(false);
}

function reCreateTable_current(data_set) {
    while (document.getElementById("current_table").firstChild) {
        document.getElementById("current_table").firstChild.remove()
    }

    let table = document.querySelector('#current_table');

    now = new Date();

    day = now.getDate(); 
    month = now.getMonth(); 
    year = now.getFullYear();

    status_nameAndColor = {
        downtime: {
            name: "Простой",
            color: "#FF5F5F"
        },
        repair: {
            name: "Наладка",
            color: "#fbec64"
        },
        work: {
            name: "Работает",
            color: "#35EC73"
        },
        off: {
            name: "Выключен",
            color: "#EAEAEA"
        },
        x_off: {
            name: "Выключен",
            color: "#EAEAEA"
        }
    }

    var items = data_set.items;
    console.log(items);
    // items.sort((a, b) => b.current_status_duration_min - a.current_status_duration_min );
    // items.sort((a, b) => a.current_status > b.current_status ? 1 : -1);
    items.sort(function(a,b) { return a.current_status.localeCompare(b.current_status) || (b.current_status_duration_min - a.current_status_duration_min ) });
    var updateTime = new Date(data_set.updateTime);
    var availableDate = data_set.availableDate;

    update_hour = updateTime.getHours(); 
    update_minute = updateTime.getMinutes(); 
    update_second = updateTime.getSeconds();

    let p_current_date = document.getElementById("p_current_date");
    let p_update_date = document.getElementById("p_update_date");
    p_current_date.innerHTML = "Данные на " + day + " " + month_rus[month] + " " + year + " года (" + (String(day).length == 1 ? "0" + day : day) + "." + (String(month).length == 1 ? "0" + (Number(month)+1) : (Number(month)+1)) + "." + year + ")";
    p_update_date.innerHTML = "обновление было в " + (String(update_hour).length == 1 ? "0" + update_hour : update_hour) +":"+(String(update_minute).length == 1 ? "0" + update_minute : update_minute) + ":" + (String(update_second).length == 1 ? "0" + update_second : update_second);


    header_text = ["Станок", "Статус", "Продолжительность ч."];
    header_name = ["machine_name_2", "current_status", "current_status_duration_min"];
    for(i=-1; i < items.length; i++) {  
        let tr = document.createElement('tr');
        for(j=0; j < header_name.length; j++) {  
            if(i == -1) { 
                let th = document.createElement('th');
                th.innerHTML = header_text[j];
                if(j == 0) th.style.borderTopLeftRadius = "20px";
                if(j == header_name.length - 1) th.style.borderTopRightRadius = "20px";
                tr.appendChild(th);
            } 
            else { 
                let td = document.createElement('td');
                if(i == items.length - 1) {
                    if(j == 0) td.style.borderBottomLeftRadius = "20px";
                    if(j == header_name.length - 1) td.style.borderBottomRightRadius = "20px";
                }
                if(header_name[j] != "current_status_duration_min") { 
                    if(header_name[j] == "current_status"){
                        td.innerHTML = status_nameAndColor[items[i][header_name[j]]]["name"];
                    }
                    else {
                        if(header_name[j] == "machine_name_2") {  
                            td.innerHTML = stanok_name[items[i][header_name[j]]] ;
                        } 
                        else {
                            td.innerHTML = items[i][header_name[j]] ;
                        }
                    }
                }
                else { 
                    let deltya = items[i][header_name[j]] > 126720 ? items[i][header_name[j]] - 126720 : ( items[i][header_name[j]] > 84960 ? items[i][header_name[j]] - 84960 : items[i][header_name[j]]);
                    h = Math.floor(deltya / 60);
                    m = Math.floor(deltya - (h * 60));
                    td.innerHTML = returnCasesHours(h) + " " + returnCasesMinutes(m);
                    if(td.innerHTML.replace(/\s/g, '') == "") td.innerHTML = items[i]["current_status"] == "downtime" ? "только закончили" : td.innerHTML = items[i]["current_status"] == "x_off" ? "только выключили" : "только начали";
                }
                td.style.backgroundColor = status_nameAndColor[items[i][header_name[1]]]["color"];
                tr.appendChild(td);
            } 
        }
        table.appendChild(tr);
    }
    modalWindow(false);
    // createTable();
}

function clearChild(id) {
    while (document.getElementById(id).firstChild) {
        document.getElementById(id).firstChild.remove()
    }
}

function updateButtonClick() {
    var xhttp = new XMLHttpRequest();
    xhttp.addEventListener("load", function() {
        if (xhttp.status === 200) {
            // result = JSON.parse(xhttp.response);
            console.log(xhttp.response);
            modalWindow(false);
        } else {
            console.log(xhttp);
        }
    });
    xhttp.open("GET", hostURL + "test");
    // xhttp.setRequestHeader("Authorization", "Bearer " + userToken);
    xhttp.send();
}

//====================================================================================================
//                                      общие функции                                               //
//====================================================================================================

function onLoadBody(){
    current_query();
    calendarConditions()
}

function calendarConditions() {
    var _startInput = document.getElementById("startDate");
    var _endInput = document.getElementById("endDate");

    const _today = new Date();

    _startInput.setAttribute('max', convertDate(_today));
    _startInput.value = convertDate(_today);

    _endInput.setAttribute('max', convertDate(_today));
    _endInput.setAttribute('min', convertDate(_today));
    _endInput.value = convertDate(_today);
}

function calendarChange(isStart) {
    var _startInput = document.getElementById("startDate");
    var _endInput = document.getElementById("endDate"); 

    var _startDate = _startInput.value;
    var _endDate = _endInput.value;

    if(isStart) {
        _endInput.setAttribute('min', _startDate);
    } else {
        _startInput.setAttribute('max', _endDate);
    }
    checkSelectedCalendar();
}

function checkSelectedCalendar() {
    const _today = new Date();

    var _startInput = document.getElementById("startDate");
    var _endInput = document.getElementById("endDate");
    var _table = document.getElementById("main_table");

    var _startDate = new Date(_startInput.value);
    var _endDate = new Date(_endInput.value);

    if(_endDate >= _startDate && _endDate <= _today) {
        _endInput.style.borderColor = '#187bcf';
        if(_startDate >= new Date('2021-12-01')) {
            _startInput.style.borderColor = '#187bcf';
            _table.style.filter = 'drop-shadow(0px 0px 58px rgba(24, 123, 207, 0.33))';
            document.getElementById('err').innerHTML = '';
            queryHistoryTable(convertDate(_startDate), convertDate(_endDate));
        } else {
            _startInput.style.borderColor = 'red';
            _table.style.filter = 'drop-shadow(0px 0px 58px rgba(255, 95, 95, 0.33))';
            document.getElementById('err').innerHTML = 'За такой период нет данных';
        }
    }
    else {
        _endInput.style.borderColor = 'red';
        _table.style.filter = 'drop-shadow(0px 0px 58px rgba(255, 95, 95, 0.33))';
        document.getElementById('err').innerHTML = 'За такой период нет данных';
    }
}

function convertDate(date){
    _year = date.getFullYear();
    _month = String(date.getMonth()).length == 2 ? (date.getMonth() + 1) : "0" + (date.getMonth() + 1);
    _day = String(date.getDate()).length == 2 ? date.getDate() : "0" + date.getDate();

    return _year + "-" + _month + "-" + _day;
}

function dateCheck(date) {
    _result = false;
    for(key in dateItems.working_date) {
        if(dateItems.working_date[key] == date) _result = true;
    }
    console.log("res = " + _result + "; " + date);
    return _result;
}

function modalWindow(open){
    var modal = document.getElementById("loadServer");
    if(open) {
        modal.style.display = "flex";
    }
    else {
        modal.style.display = "none";
    }
}

function returnCasesHours(hour){
    var result = "";
    var h = hour;
    if(hour > 20) h = hour - (Math.floor(hour / 10) * 10);
    if(h == 1) result = hour + " час";
    if(h >= 2 && h <= 4) result = hour + " часа";
    if(h >= 5 && h <= 20 || h == 0 && hour >= 10) result = hour + " часов";
    return result;
}

function returnCasesMinutes(minutes){
    var result = "";
    var m = minutes;
    if(minutes > 20) m = minutes - (Math.floor(minutes/10)*10);
    if(m == 1) result = minutes + " минута";
    if(m >= 2 && m <= 4) result = minutes + " минуты";
    if(m >= 5 && m <= 20) result = minutes + " минут";
    if((String(minutes).length == 2) &&  (String(minutes).indexOf(0) != -1) ) result = minutes + " минут";
    return result;
}

function checkSelected() {
    var _day = document.getElementById("day").value;
    var _month = document.getElementById("month").value;
    var _year = document.getElementById("year").value;

    var _but = document.getElementById("but_createTable");
    document.getElementById("err").innerHTML = "";
    
    if(_day != '' && _month != '' && _year != '') {
        _but.style.backgroundColor = "#187BCF";
        _but.style.border = "1px solid #187BCF";
        _but.style.cursor = "pointer";
    }
}

//====================================================================================================
//                                      дополнения                                                  //
//====================================================================================================

setInterval(() => {
    var _now = new Date();
    if((now.getHours() == 3 && now.getMinutes() == 0)) {
        document.location.reload();
    }
    else {
        current_query();    
    }
}, 30000);

//filter: drop-shadow(0px 0px 58px rgba(255, 95, 95, 0.50));