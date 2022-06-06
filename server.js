var express = require( 'express' ),
    bodyParser = require('body-parser'),
    app = express();

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use(express.static('public'));



//переменные ---------------------------------------------------------------------

    var ObjMainDate;

//--------------------------------------------------------------------- переменные



//firebase ---------------------------------------------------------------------

    var FBAdmim = require("firebase-admin");

    var FBServiceAccountKey = require("./serviceAccountKey.json");

    FBAdmim.initializeApp({
        credential: FBAdmim.credential.cert(FBServiceAccountKey),
        databaseURL: "https://diplom-ea147-default-rtdb.asia-southeast1.firebasedatabase.app"
    });

    FBDataBase = FBAdmim.database();

    //ссылки на объект в FB --------------------
        ObjMainDate = FBDataBase.ref('/main');
    //-------------------- ссылки на объект в FB 

    //выгрузка в переменные --------------------
        ObjMainDate.on('value', (snapshot) => {
            const _unDATA = snapshot.val();
            ObjMainDate = _unDATA;
        });
    //-------------------- выгрузка в переменные 

//--------------------------------------------------------------------- firebase



//обработка запросов ---------------------------------------------------------------------

    app.get("/", function (req,res){
        //рисуем файл и передаем туда значение itemMas и sqlResult (в том файле они будут как items и result соответсвенно)
        res.render('index.ejs');
    });

    app.get("/verification", function (req,res){
        let _strAutorization= req.headers.authorization;
        let _blResult = rRBlCheckLoginAndPassword(_strAutorization);

        res.send(_blResult);
    });

    app.get("/orders", function (req, res){
        let _strToken= req.query.token;
        let _strLogin = rRStrLogin(_strToken);
        let _strName = ObjMainDate['profile'][_strLogin]['name'];
        let _strPatronymic = ObjMainDate['profile'][_strLogin]['patronymic'];
        let _strSurname = ObjMainDate['profile'][_strLogin]['surname'];
        let _strRoleId = ObjMainDate['profile'][_strLogin]['role'];
        let _strRoleName = ObjMainDate['manualRole'][_strRoleId];

        res.render("orders.ejs", {str_Name: _strName, str_Patronymic: _strPatronymic, str_Surname: _strSurname, str_RoleName: _strRoleName, str_RoleId: _strRoleId});
    });

    app.get("/getOrders", function (req, res){
        res.send(ObjMainDate["orders"]);
    });

    app.get("/getManualProduct", function (req, res){
        res.send(ObjMainDate["manualProduct"]);
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



//функции ---------------------------------------------------------------------------------------- 

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

    function rRBlCheckLoginAndPassword(strAuth){
        let _strAutorization= strAuth;
        let _strBase64 = _strAutorization.split('c ')[1];
        let _strBuff = Buffer.from(_strBase64, 'base64');
        let _strUserToken = _strBuff.toString('utf-8');
        let _strLogin = _strUserToken.split(':')[0].replace(/[.]/g,'');
        let _strPass = _strUserToken.split(':')[1];

        if(ObjMainDate['profile'].hasOwnProperty(_strLogin)){
            if(ObjMainDate['profile'][_strLogin]['password'] == _strPass) {
                return true;
            }
        }

        return false;
    }

    function rRStrLogin(strAuth) {
        let _strBuff = Buffer.from(strAuth, 'base64');
        let _strUserToken = _strBuff.toString('utf-8');
        return _strUserToken.split(':')[0].replace(/[.]/g,'');
    }


//---------------------------------------------------------------------------------------- функции