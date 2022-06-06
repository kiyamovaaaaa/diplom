const THIS_URL = window.location.href; // текущий адрес
const HOST_URL = THIS_URL.substr(0,THIS_URL.indexOf("/",8)+1); //адресс хоста

var StrUserToken;

var ObjOrdersTable;
var ObjManualProductsTable;

var ObjOrders_Manual = {
  id:"№ Заказа",
  FIO:"ФИО клиента",
  Tel:"Телефон",
  cost:"Цена за ед.",
  dateReg:"Дата создания",
  dateRel:"Дата завершения",
  product:"Продукт",
  qty:"Кол-во",
  status:"Статус",
  sum:"Сумма"
  
}
var ObjStatus_Manual = {
  "в обработке":"#356FFF",
  "в производстве":"#B7560F",
  "завершен":"#00C844",
}


function vRLoadBody() {
    StrUserToken = getCookie("user");
    vVRole();
    rQGetManualProduct();
}

function vVRole(){
    var _elRole = document.getElementById("_userRoleId_p");
    var _strRoleId = _elRole.innerText.trim();

    var _elCreateOrdersButton = document.getElementById("_createOrder_button");

    switch(_strRoleId) {
        case "0":
            _elCreateOrdersButton.style.display = "flex";
        break;
        case "1":
            _elCreateOrdersButton.style.display = "none";
        break;
        case "2":
            _elCreateOrdersButton.style.display = "flex";
        break;
        case "3":
            _elCreateOrdersButton.style.display = "none";
        break;
    }
}

function vVModalWindowControll(strModalId, strDisplayType) {
    document.getElementById(strModalId).style.display = strDisplayType;
}

function rQGetOrders() {
  vVModalWindowControll("_modalBack_div", "flex");
  var xhttp = new XMLHttpRequest();
   xhttp.addEventListener("load", function() {
      if (xhttp.status === 200) {
          if(xhttp.response!="ошибка"){
              result = JSON.parse(xhttp.response);
              ObjOrdersTable = result;
              vVCrateTable();
          }
          else {
          }
      } else {
          console.log(xhttp);
      }
  });
  xhttp.open("GET", encodeURI( HOST_URL + "getOrders" ));
  // xhttp.setRequestHeader("Authorization", "Bearer " + userToken);
  xhttp.send();
}

function rQGetManualProduct() {
  vVModalWindowControll("_modalBack_div", "flex");
  var xhttp = new XMLHttpRequest();
   xhttp.addEventListener("load", function() {
      if (xhttp.status === 200) {
          if(xhttp.response!="ошибка"){
              result = JSON.parse(xhttp.response);
              ObjManualProductsTable = result;
              rQGetOrders();
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

function vVViewOrder(strIndex) {
  var _elHeader = document.getElementById("_viewOrdersHeader_p");
  var _elStatus = document.getElementById("_status_p");
  var _elSum = document.getElementById("_sum_p");
  var _elFIO = document.getElementById("_FIO_input");
  var _elTel = document.getElementById("_tel_input");
  var _elProduct = document.getElementById("_product_input");
  var _elQty = document.getElementById("_qty_input");
  var _elCost = document.getElementById("_cost_input");

  _elHeader.innerHTML = "Просмотр заказа №" + strIndex;

  _elStatus.innerHTML = "(" + ObjOrdersTable[strIndex]["status"] + ")";
  _elStatus.style.color = ObjStatus_Manual[ObjOrdersTable[strIndex]["status"]];

  _elSum.value = ObjOrdersTable[strIndex]["sum"];

  _elFIO.value = ObjOrdersTable[strIndex]["FIO"];

  _elTel.value = ObjOrdersTable[strIndex]["Tel"];

  _elProduct.value = ObjManualProductsTable[ObjOrdersTable[strIndex]["product"]]["name"];

  _elQty.value = ObjOrdersTable[strIndex]["qty"];
  
  _elCost.value = ObjOrdersTable[strIndex]["cost"];

  vVModalWindowControll("_viewOrders_div", "flex");

}

function vVCrateTable(){
  let _objItems = ObjOrdersTable;
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
        if(_arrKeys[j] == "status") td.style.color = ObjStatus_Manual[_objItems[i]["status"]];
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