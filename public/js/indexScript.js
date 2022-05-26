const THIS_URL = window.location.href; // текущий адрес
const HOST_URL = THIS_URL.substr(0,THIS_URL.indexOf("/",8)+1); //адресс хоста

function vVErrorLabel(strText) {
    let _elLabel = document.getElementById('_errLabel_p');
    _elLabel.innerHTML = strText;
}

function vRLoginAndPasswordCheck() {
    _strLogin = document.getElementById("_log_input").value;
    _strPassword = document.getElementById("_pass_input").value;
    _strUserEncode = btoa(_strLogin + ":" + _strPassword);
    
    if(_strLogin.length != 0) {
        if(_strPassword.length != 0){
            vQVerification(_strUserEncode);
        }
        else {
            vVErrorLabel("Заполните пароль!");
        }
    }
    else {
        vVErrorLabel("Заполните логин!");
    }
    
}

function vQVerification(strUserEncode) {
    var xhttp = new XMLHttpRequest();
    xhttp.addEventListener("load", function() {
        if (xhttp.status === 200) {
            if(xhttp.response == "false"){
                vVErrorLabel("Неверный пароль или логин!");
            }
            else {
                if(xhttp.response == "not_connect"){
                    vVErrorLabel("Нет доступа с сервером</br>Проверьте соединение или попробуйте позже");
                }
                else {
                    vVErrorLabel("Удачно!!!");
                }
            }
        } else {
            console.log(xhttp);
        }
    });
    xhttp.open("GET", HOST_URL + "verification");
    xhttp.setRequestHeader("Authorization", "Basic " + strUserEncode);
    xhttp.send();
}