const THIS_URL = window.location.href; // текущий адрес
const HOST_URL = THIS_URL.substr(0,THIS_URL.indexOf("/",8)+1); //адресс хоста

function vVErrorLabel(strText) {
    let _elLabel = document.getElementById('_errLabel_p');
    _elLabel.innerHTML = strText;
}

function vVModalWindowControll(strModalId, strDisplayType) {
    document.getElementById(strModalId).style.display = strDisplayType;
}

function vRLoginAndPasswordCheck() {
    vVModalWindowControll("_modalBack_div", "flex");
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
    vVModalWindowControll("_modalBack_div", "none");
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
                    setCookie("user", strUserEncode);
                    document.location.href = HOST_URL + "orders?token=" + strUserEncode;
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




/* =============================================================================================================================== */
/*                                               работа с куки                                                                     */
/* =============================================================================================================================== */




//получает куки (код украден)
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

//удаляет куки (код украден)
function deleteCookie(name) {
    setCookie(name, "", {
      'max-age': -1
    })
}

//задает куки (код украден)
function setCookie(name, value, options = {}) {

    options = {
      path: '/',
      // при необходимости добавьте другие значения по умолчанию
      ...options
    };
  
    if (options.expires instanceof Date) {
      options.expires = options.expires.toUTCString();
    }
  
    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  
    for (let optionKey in options) {
      updatedCookie += "; " + optionKey;
      let optionValue = options[optionKey];
      if (optionValue !== true) {
        updatedCookie += "=" + optionValue;
      }
    }
  
    document.cookie = updatedCookie;
}

//очищает токен "user"
function clear_tokenInCockie(){
  deleteCookie("user");
  document.location.href = HOST_URL;
}