const THIS_URL = window.location.href; // текущий адрес
const HOST_URL = THIS_URL.substr(0,THIS_URL.indexOf("/",8)+1); //адресс хоста

var StrUserToken;

var ObjWarehouseTable;
var ObjManualProductsTable;

var ObjOrders_Manual = {
    id:"№ позиции",
    product:"Продукт",
    qty:"Кол-во"
  }

function vRLoadBody() {
    StrUserToken = getCookie("user");
    vVRole();
    rQGetManualProduct();
}

function vVNavigate(el){
    switch(el.innerText) {
      case "Склад":
        document.location.href = HOST_URL + "warehouse?token=" + StrUserToken;
      break;
      case "Заказы":
        document.location.href = HOST_URL + "orders?token=" + StrUserToken;
      break;
      case "Производство":
        document.location.href = HOST_URL + "production?token=" + StrUserToken;
      break;
    }
}

function vVRole(){
    var _elRole = document.getElementById("_userRoleId_p");
    var _strRoleId = _elRole.innerText.trim();

    switch(_strRoleId) {
        case "0":

        break;
        case "1":

        break;
        case "2":

        break;
        case "3":

        break;
    }
}

function rQGetManualProduct() {
    vVModalWindowControll("_modalBack_div", "flex");
    var xhttp = new XMLHttpRequest();
        xhttp.addEventListener("load", function() {
        if (xhttp.status === 200) {
            if(xhttp.response!="ошибка"){
                result = JSON.parse(xhttp.response);
                ObjManualProductsTable = result;
                rQGetWarehouse();
            }
            else {
            }
        } else {
            console.log(xhttp);
        }
    });
    xhttp.open("GET", encodeURI( HOST_URL + "getManualProduct" ));
    // xhttp.setRequestHeader("Authorization", "Bearer " + userToken);
    xhttp.send();
}

function rQGetWarehouse() {
  vVModalWindowControll("_modalBack_div", "flex");
  var xhttp = new XMLHttpRequest();
   xhttp.addEventListener("load", function() {
      if (xhttp.status === 200) {
          if(xhttp.response!="ошибка"){
              result = JSON.parse(xhttp.response);
              ObjWarehouseTable = result;
              vVCreateTable();
          }
          else {
          }
      } else {
          console.log(xhttp);
      }
  });
  xhttp.open("GET", encodeURI( HOST_URL + "getWarehouse" ));
  // xhttp.setRequestHeader("Authorization", "Bearer " + userToken);
  xhttp.send();
}

function vVModalWindowControll(strModalId, strDisplayType) {
    document.getElementById(strModalId).style.display = strDisplayType;
}

function vVCreateTable(){
  let _objItems = ObjWarehouseTable;
  while (document.getElementById("_table_table").firstChild) {
    document.getElementById("_table_table").firstChild.remove()
  }

  let _elTable = document.querySelector('#_table_table');
  let _arrKeys = Object.keys(_objItems[0]);

  for(let i = -1; i < _objItems.length; i++) {
    let tr = document.createElement('tr');
    if(i != -1) {
      for(let j = -1; j < (_arrKeys.length); j++){
        let td = document.createElement('td');
        td.innerHTML = j != -1 ? _objItems[i][_arrKeys[j]] : i;
        td.id = i + "_td_" + j;
        //условия//
        if(j%2 === 0) td.style.backgroundColor = "#F9F9F9";
        if(_arrKeys[j] == "product") td.innerHTML = ObjManualProductsTable[_objItems[i]["product"]]["name"];
        td.setAttribute("onclick", "vVViewOrder("+ i + ")");
        //условия//
        tr.appendChild(td);
      }
    } else {
      for(let j = -1; j < _arrKeys.length; j++){
        let th = document.createElement('th');
        th.innerHTML = j != -1 ? ObjOrders_Manual[_arrKeys[j]] : ObjOrders_Manual["id"];
        th.id = "th_" + j;
        //условия//
        tr.className = "trHeader";
        if(j%2 === 0) th.style.backgroundColor = "#F9F9F9";
        //условия//
        tr.appendChild(th);
      }
    }
    _elTable.appendChild(tr);
  }
  vVModalWindowControll("_modalBack_div", "none");
}

function tabulator(data){
  let result;
  let text = data.toString();
  if(text.indexOf(".") == -1)
    result = text.replace(/\B(?=(?:\d{3})+(?!\d))/g, ' ');
  else {
    splitText = text.split(".");
    result = splitText[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, ' ') + "." + splitText[1];
  }
  return result;
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

