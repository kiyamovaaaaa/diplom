var express = require( 'express' ),
    bodyParser = require('body-parser'),
    app = express();

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use(express.static('public'));



//переменные ---------------------------------------------------------------------

    let url;
    const STR_USER_TOKEN = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMSJ9.fTywjPw8BGQTAzHVtqJr1shHhzWoPPZxipiJn9u_EQc";
    //Подготавливаем пустой массив, потом сюда вложим данные полученные с сервера
    var sqlResult = new Array(); 
    var sqlResult_obj = new Array(); //записываются данные с исторической таблицы
    var sqlResult_current = new Array(); //записываются данные с актуальной таблицы
    var updateTime = ""; //когда была выгрузка с sql таблицы
    var availableDate = {
        day:[],
        month:[],
        year:[]
    }; 
    //создаем переменную запроса
    var strRequest = "SELECT * FROM [TEST].[dbo].[KhAS_machine_status]";
    var strRequest2 = "SELECT * FROM [TEST].[dbo].[KhAS_curr_machine_status]";

//--------------------------------------------------------------------- переменные



//читать ini ---------------------------------------------------------------------

var ini = require('node-ini');
var testData = "no";
ini.parse('./config.ini', function(err,data){
  if(err) {
      console.log(err);
  } else {
    testData = data;
    url = "http://" + data["servers"]["ip"] + ":" + data["servers"]["port"] + "/";
    console.log(url);
  }
});

//--------------------------------------------------------------------- читать ini 



//функции sql запросов ---------------------------------------------------------------------

    //старт запроса №1 (сразу подвязан автомотический старт запроса №2 после обработки запроса №1)
    function connectInSql(){
        var Connection = require('tedious').Connection;
        var config = {  
            server: 's0035',  //имя сервера
            authentication: {
                type: 'default',
                options: {
                    userName: 'PBI', //логин
                    password: 'KamazPBI2020'  //пароль
                }
            },
            options: {
                supportBigNumbers: true,
                bigNumberStrings: true
                // encrypt: true,
                // database: 'TEST'  //имя Базы Данных
            }
        };
        var connection = new Connection(config); 
        var Request = require('tedious').Request;

        connection.on('connect', function(err) {  
            if(err){ 
                console.log("ERORR = " + err); 
            }
            else 
            console.log("Connected All ");  
            executeStatement(Request, connection); 
        });
        connection.connect();
    }

    //старт запроса №2
    function connectInSql_matRef(){
        var Connection_MatRef = require('tedious').Connection;
        var config_MatRef = {  
            server: 's0035',  //имя сервера
            authentication: {
                type: 'default',
                options: {
                    userName: 'PBI', //логин
                    password: 'KamazPBI2020'  //пароль
                }
            },
            options: {
                supportBigNumbers: true,
                bigNumberStrings: true
                // encrypt: true,
                // database: 'TEST'  //имя Базы Данных
            }
        };
        var connection_MatRef = new Connection_MatRef(config_MatRef); 
        var Request2 = require('tedious').Request;
    
        connection_MatRef.on('connect', function(err) {  
            if(err){ 
                console.log("ERORR = " + err); 
            }
            else 
            console.log("Connected MatRef ");  
            executeStatement_MatRef(Request2, connection_MatRef); 
        });
        connection_MatRef.connect();
    }

    //обработка запроса №1 (после обработки вызывается старт запроса №2)
    function executeStatement(Request, connection) { 
        //выполняем запрос на получение таблицы и вызываем функцию (которая возвращает в переменную "err" ошибки) 
        request = new Request(strRequest, function(err) {  
            if (err) {  //если в переменной есть какое либо значение значит произошла ошибка, выводим эту ошибку в консоль
                console.log(err);
            }  
        });
    
        //добавляем переменную для записи в нее номер строки
        var index = 0;
        //пробегаемся по каждой строке таблицы
        request.on('row', function(columns) {  
            //добавляем переменную для записи в нее номер столбца
            var Jindex = 0;
            // console.log(columns);
            //создаем массив для записи в нее записи с каждого столбца
            inArray = new Array();
            inObj = {};
            //пробегаемся по каждому столбцу в строке
            // console.log(columns);
            columns.forEach(function(column) {  
                if (column.value === null) {  //если в ячейке нет значений то записываем значение "пусто" (на всякий случай)
                    inArray[Jindex] = "пусто";
                    inObj[column.metadata.colName] = "пусто";
                } else { //если в ячейке есть значение то...
                    inArray[Jindex] = column.value; //...записываем это значение в массив с индекссом номера столбца
                    inObj[column.metadata.colName] = column.value;
                    if(column.metadata.colName == "working_date") {
                        _date = new Date(column.value);
                        
                        _day = _date.getDate();
                        _month = _date.getMonth();
                        _year = _date.getFullYear();
    
                        if(availableDate.day.indexOf(_day) == -1) availableDate.day[availableDate.day.length] = _day;
                        if(availableDate.month.indexOf(_month) == -1) availableDate.month[availableDate.month.length] = _month;
                        if(availableDate.year.indexOf(_year) == -1) availableDate.year[availableDate.year.length] = _year;
                    }
                    
                    // if(column.metadata.colName == "work") console.log(column.metadata.type);     
                } 
                Jindex++; //переходим к следующему столбцу (прибавляем один к индексу номера столбца)
            });  
            sqlResult[index] = inArray;  //записываем массив столбцов в массив, который мы описали в самом начале кода с индексом номера строки
            sqlResult_obj[index] = inObj;
            //т.е мы в элемент массива равный номеру строки вставляем весь массив столбцов (массив в массиве)
            index++; //переходим к следующей строке (прибавляем один к индексу номера строки)
        });  
        updateTime = new Date();
        //после записи данных в переменную закрываем подключение (чтобы не нагружать сервер)
        request.on("requestCompleted", function (rowCount, more) {
            connection.close();
            connectInSql_matRef();
            // console.log(sqlResult_obj);
            console.log("connection close");
        });
        connection.execSql(request);  
    }  

    //обработк запроса №2
    function executeStatement_MatRef(Request2, connection_MatRef) { 
        //выполняем запрос на получение таблицы и вызываем функцию (которая возвращает в переменную "err" ошибки) 
        request = new Request2(strRequest2, function(err) {  
            if (err) {  //если в переменной есть какое либо значение значит произошла ошибка, выводим эту ошибку в консоль
                console.log(err);
            }  
        });
        //добавляем переменную для записи в нее номер строки
        var index = 0;
        //пробегаемся по каждой строке таблицы
        request.on('row', function(columns) {  
            //добавляем переменную для записи в нее номер столбца
            var Jindex = 0;
            // console.log(columns);
            //создаем массив для записи в нее записи с каждого столбца
            inObj = {};
            //пробегаемся по каждому столбцу в строке
            // console.log(columns);
            columns.forEach(function(column) {  
                if (column.value === null) {  //если в ячейке нет значений то записываем значение "пусто" (на всякий случай)
                    inObj[column.metadata.colName] = "пусто";
                } else { //если в ячейке есть значение то...
                    inObj[column.metadata.colName] = column.value;
                } 
                Jindex++; //переходим к следующему столбцу (прибавляем один к индексу номера столбца)
                // if(column.metadata.colName == "current_status_duration_min") console.log(column.metadata.type);
            });  
            sqlResult_current[index] = inObj;
            //т.е мы в элемент массива равный номеру строки вставляем весь массив столбцов (массив в массиве)
            index++; //переходим к следующей строке (прибавляем один к индексу номера строки)
        }); 
        //после записи данных в переменную закрываем подключение (чтобы не нагружать сервер)
        request.on("requestCompleted", function (rowCount, more) {
            connection_MatRef.close();
            console.log(sqlResult_current);
            console.log("connection close");
        });
        connection_MatRef.execSql(request);  
    }

    function connectInSql_TEST(){
        var error;
        connection.reset(error);
        connection_MatRef.reset();
        connectInSql();
    }

//--------------------------------------------------------------------- функции sql запросов 



//обработка запросов ---------------------------------------------------------------------

    app.get("/", function (req,res){
        //рисуем файл и передаем туда значение itemMas и sqlResult (в том файле они будут как items и result соответсвенно)
        res.render('index.ejs');
        console.log(sqlResult_current);
    });

    app.get("/test", function (req,res){
        connectInSql();
        res.send("обновлено");
        // console.log(sqlResult);
    });

    app.get("/tableDate", function(req,res){
        date = req.query.date;
        log_generate( "/tableDate", "", 3, "Вот дата - " + date, req.ip.split(":").pop(), "");
        const request = require('request');
        var answer = 'null';
        request(
            {
                method: 'GET',
                url: encodeURI(url + "machine_status/status_duration?date=" + date),
                headers: {
                    Authorization: STR_USER_TOKEN
                }
            }, 
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    answer = JSON.parse(body);
                    // answer = body;
                    console.log(answer);
                    res.send(answer);
                    log_generate( "/tableDate", "machine_status/status_duration", 3, "Пришел ответ на историческую таблицу - " + result, req.ip.split(":").pop(), "");
                }
                else {
                    res.send("ошибка");
                    log_generate( "/tableDate", "machine_status/status_duration", 2, "Пришла ошибка на историческую таблицу - " + error, req.ip.split(":").pop(), "");
                }
            }
        );
    });

    app.get("/historyTable", function(req,res){
        startDate = req.query.startDate;
        endDate = req.query.endDate;

        log_generate( "/historyTable", "", 3, "Попытка выгрузить данные с " + startDate + ", по " + endDate, req.ip.split(":").pop(), "");
        const request = require('request');
        var answer = 'null';
        request(
            {
                method: 'GET',
                url: encodeURI(url + "machine_status/status_duration_date_period?start_date=" + startDate + "&end_date=" + endDate),
                headers: {
                    Authorization: STR_USER_TOKEN
                }
            }, 
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    answer = JSON.parse(body);
                    // answer = body;
                    console.log(answer);
                    res.send(answer);
                    log_generate( "/historyTable", "machine_status/status_duration_date_period", 3, "Пришел ответ на историческую таблицу с периодам - " + result, req.ip.split(":").pop(), "");
                }
                else {
                    res.send("ошибка");
                    log_generate( "/historyTable", "machine_status/status_duration_date_period", 2, "Пришла ошибка на историческую таблицу с периодам - " + error, req.ip.split(":").pop(), "");
                }
            }
        );
    });

    app.get("/currentTableDate", function(req,res){
        log_generate( "/currentTableDate", "", 3, "Пришел запрос на актуальную таблицу ", req.ip.split(":").pop(), "");
        const request = require('request');
        var answer = 'null';
        date = new Date();
        request(
            {
                method: 'GET',
                url: encodeURI(url + "machine_status/current_machines_status?method=get"),
                headers: {
                    Authorization: STR_USER_TOKEN
                }
            }, 
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    answer = JSON.parse(body);
                    result = {
                        items: answer,
                        updateTime: date, 
                        availableDate: availableDate,
                    };
                    // answer = body;
                    console.log(answer);
                    res.send(result);
                    log_generate( "/currentTableDate", "machine_status/current_machines_status", 3, "Пришел ответ на актуальную таблицу - " + result, req.ip.split(":").pop(), "");
                }
                else {
                    res.send("ошибка");
                    log_generate( "/currentTableDate", "machine_status/current_machines_status", 2, "Пришла ошибка на актуальную таблицу - " + error, req.ip.split(":").pop(), "");
                }
            }
        );
    });

    app.get("/test2", function (req,res){
        const request = require('request');
        var answer = 'null';
        date = new Date();
        request(
            {
                method: 'GET',
                url: encodeURI(url + "/machine_status/available_dates?method=get"),
                headers: {
                    Authorization: user_token
                }
            }, 
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    answer = JSON.parse(body);
                    // answer = body;
                    console.log(answer);
                    res.send(answer);
                }
                else {
                    res.send("ошибка");
                }
            }
        );
    });

    app.get('/redir', function(req,res){
        const request = require('request');
        var answer = 'null';
        request(
            {
                method: 'GET',
                url: encodeURI("http://10.135.128.30:8100/test"),
            }, 
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // answer = JSON.parse(body);
                    answer = body;
                    console.log(answer);
                    res.send(answer);
                }
                else {
                    res.send("ошибка");
                }
            }
        );
    });

//--------------------------------------------------------------------- обработка запросов 



//найстройки таймера ---------------------------------------------------------------------

    // setInterval(() => {timerTick()},1000);
    // function timerTick(){
    //     now = new Date();
    //     if(now.getSeconds() == "53"){
    //         console.log("TICK!!!");
    //         connectInSql();
    //     }
    // }

//--------------------------------------------------------------------- найстройки таймера



//настройки сервера (node js) --------------------------------------------------------------------- 

    let port = process.env.PORT;
    if (port == null || port == "") {
    port = 8000;
    }

    //запускаем сервак
    app.listen(port,function () {
        console.log("Сервак запустился на " + port + " порту");
    })

//--------------------------------------------------------------------- настройки сервера (node js) 

function log_generate( place_local, place_server, type, text, client_ip, client_tocken) {
    let now = new Date();
    let _Date = String(now.getDate());
    let _Month = String(now.getMonth()+1);
    let _Year = String(now.getFullYear());
    let _Hours = String(now.getHours());
    let _Minutes = String(now.getMinutes());
    let _Seconds = String(now.getSeconds()+1);
    let _Milliseconds = String(now.getMilliseconds()+1);
    
    let _client_token_code;
    let _client_name_obj;
    let _name;
    if(client_tocken != ""){
        _client_token_code = client_tocken.slice(7);
        _client_name_obj = jwt_decode(_client_token_code);
        _name = _client_name_obj.user;
    }
    else {
        _name = "";
    }
    
    // let dataTime = now.getDate() + "." + now.getMonth() + "." + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + ":" + now.getMilliseconds();
    let dataTime = (_Date.length == 2 ? _Date : "0" + _Date) + "." + (_Month.length == 2 ? _Month : "0" + _Month) + "." + _Year + " " + (_Hours.length == 2 ? _Hours : "0" + _Hours) + ":" + (_Minutes.length == 2 ? _Minutes : "0" + _Minutes) + ":" + (_Seconds.length == 2 ? _Seconds : "0" + _Seconds) + ":" + (_Milliseconds.length == 3 ? _Milliseconds : (_Milliseconds.length == 2 ? "0" + _Milliseconds : "00" + _Milliseconds));
    let placeText;
    let info;
    let ip_text = client_ip != "" ? "{" + client_ip + " - " + (_name != "" ? _name : "unname" ) + "}" : "{no ip}";

    if(place_server != ""){
        placeText = " [" + place_local + "]" + "[🠕]" + "[" + place_server + "] ";
    }
    else {
        placeText = " [" + place_local + "]" + "[🠗] ";
    }

    switch(type) {
        case 1:
            info = " -- " + text + " -- ";
        break;
        case 2:
            info = " !! " + text + " !! ";
        break;
        case 3:
            info = " == " + text + " == ";
        break;
        default:
            info = " ? " + text + " ? ";
        break;
    }

    let result_log = "(" + dataTime + ")" + placeText + ip_text + info;
    
    const fs = require('fs');
    fs.appendFile('logs.txt', "\n" + result_log, (err) => {
        if (err) throw err;
        // console.log('Lyric saved!');
    });

    console.log(result_log + "\n");
}