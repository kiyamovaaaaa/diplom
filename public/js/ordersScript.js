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
    var _viewOrdersEditButton = document.getElementById("_viewOrdersEdit_button");
    var _viewOrdersDelButton = document.getElementById("_viewOrdersDel_button");

    switch(_strRoleId) {
        case "0":
            _elCreateOrdersButton.style.display = "flex";
            _viewOrdersEditButton.style.display = "flex";
            _viewOrdersDelButton.style.display = "flex";
        break;
        case "1":
            _elCreateOrdersButton.style.display = "none";
            _viewOrdersEditButton.style.display = "none";
            _viewOrdersDelButton.style.display = "none";
        break;
        case "2":
            _elCreateOrdersButton.style.display = "flex";
            _viewOrdersEditButton.style.display = "flex";
            _viewOrdersDelButton.style.display = "flex";
        break;
        case "3":
            _elCreateOrdersButton.style.display = "none";
            _viewOrdersEditButton.style.display = "none";
            _viewOrdersDelButton.style.display = "none";
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
              vVCreateTable();
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

  _elSum.innerHTML = tabulator(ObjOrdersTable[strIndex]["sum"]);

  _elFIO.value = ObjOrdersTable[strIndex]["FIO"];

  _elTel.value = ObjOrdersTable[strIndex]["Tel"];

  _elProduct.value = ObjManualProductsTable[ObjOrdersTable[strIndex]["product"]]["name"];

  _elQty.value = ObjOrdersTable[strIndex]["qty"];
  
  _elCost.value = tabulator(ObjOrdersTable[strIndex]["cost"]);

  vVModalWindowControll("_viewOrders_div", "flex");

}

function vVCreateTable(){
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
        if(_arrKeys[j] == "sum" || _arrKeys[j] == "qty" || _arrKeys[j] == "cost") td.innerHTML = tabulator(_objItems[i][_arrKeys[j]]);
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

function vQDeleteOrders() {
  vVModalWindowControll("_viewOrders_div", "none");
  vVModalWindowControll("_modalBack_div", "flex");

  let _elHeader = document.getElementById("_viewOrdersHeader_p");
  let _strOrderId = _elHeader.innerText.slice(17, _elHeader.length);
  
  let _strParams = "?orderId=" + _strOrderId;

  var xhttp = new XMLHttpRequest();
   xhttp.addEventListener("load", function() {
      if (xhttp.status === 200) {
          if(xhttp.response != "ошибка"){
              rQGetManualProduct();
          }
          else {
          }
      } else {
          console.log(xhttp);
      }
  });
  xhttp.open("GET", encodeURI( HOST_URL + "deleteOrders" + _strParams ));
  // xhttp.setRequestHeader("Authorization", "Bearer " + userToken);
  xhttp.send();
}

function vVReGenerateSelect(strDefault, arrDate, strSelectId) {
  while (document.getElementById(strSelectId).firstChild) {
    document.getElementById(strSelectId).firstChild.remove()
  }

  let _elSelect = document.getElementById(strSelectId);
  _elSelect.innerHTML = "<option hidden disabled selected value> (не выбрано) </option>";

  for(let i=0; i<arrDate.length; i++){
    let _option = document.createElement("option");
    _option.innerHTML = arrDate[i]["name"];
    if(arrDate[i]["name"] == strDefault) _option.selected = true;
    _elSelect.appendChild(_option);
  }
}

function vVStartEdit(){
  var _elHeaderViwer = document.getElementById("_viewOrdersHeader_p");
  var _elSumViwer = document.getElementById("_sum_p");
  var _elFIOViwer = document.getElementById("_FIO_input");
  var _elTelViwer = document.getElementById("_tel_input");
  var _elProductViwer = document.getElementById("_product_input");
  var _elQtyViwer = document.getElementById("_qty_input");
  var _elCostViwer = document.getElementById("_cost_input");

  let _strOrderId = _elHeaderViwer.innerText.slice(17, _elHeaderViwer.length);
  
  var _elHeader = document.getElementById("_editOrdersHeader_p");
  var _elSum = document.getElementById("_sumEdit_p");
  var _elFIO = document.getElementById("_FIOEdit_input");
  var _elTel = document.getElementById("_telEdit_input");
  var _elQty = document.getElementById("_qtyEdit_input");
  var _elCost = document.getElementById("_costEdit_input");

  _elHeader.innerHTML = "Редактировать заказ №" + _strOrderId;
  _elSum.innerHTML = _elSumViwer.innerHTML;
  _elFIO.value = _elFIOViwer.value;
  _elTel.value = _elTelViwer.value;
  vVReGenerateSelect(_elProductViwer.value, ObjManualProductsTable, "_productEdit_select");
  // _elProduct.value = _elProductViwer.value;
  _elQty.value = _elQtyViwer.value.replace(/\s/g, '');
  _elCost.value = _elCostViwer.value.replace(/\s/g, '');

  vVModalWindowControll("_viewOrders_div","none");
  vVModalWindowControll("_editOrders_div","flex");
}

function vQSaveEdit(){
  vVModalWindowControll("_editOrders_div", "none");
  vVModalWindowControll("_modalBack_div", "flex");

  var _elHeader = document.getElementById("_editOrdersHeader_p");
  var _elSum = document.getElementById("_sumEdit_p");
  var _elFIO = document.getElementById("_FIOEdit_input");
  var _elTel = document.getElementById("_telEdit_input");
  var _elQty = document.getElementById("_qtyEdit_input");
  var _elCost = document.getElementById("_costEdit_input");
  var _elProduct = document.getElementById("_productEdit_select");

  let _strOrderId = _elHeader.innerText.slice(21, _elHeader.length);
  let _strDateReg = ObjOrdersTable[_strOrderId]["dateReg"];
  let _strDateRel = ObjOrdersTable[_strOrderId]["dateRel"];
  let _strStatus = ObjOrdersTable[_strOrderId]["status"];

  let _strParams = "?addIndex=" + _strOrderId + "&FIO=" + _elFIO.value + "&Tel=" + _elTel.value + "&cost=" + _elCost.value.replace(/\s/g, '') + "&dateReg=" + _strDateReg + "&dateRel=" + _strDateRel + "&product=" + (_elProduct.selectedIndex - 1) + "&qty=" + _elQty.value.replace(/\s/g, '') + "&status=" + _strStatus + "&sum=" + _elSum.innerHTML.replace(/\s/g, '');

  var xhttp = new XMLHttpRequest();
   xhttp.addEventListener("load", function() {
      if (xhttp.status === 200) {
          if(xhttp.response != "ошибка"){
              rQGetManualProduct();
          }
          else {
          }
      } else {
          console.log(xhttp);
      }
  });
  xhttp.open("GET", encodeURI( HOST_URL + "updateAddOrder" + _strParams ));
  // xhttp.setRequestHeader("Authorization", "Bearer " + userToken);
  xhttp.send();

  // updateAddOrder?FIO=Ag%20Bg%20Dc&Tel=89999234&cost=1&dateReg=2022-04-05&dateRel=-&product=1&qty=5&status=в%20обработке&sum=5&addIndex=-1
}

function vROnInput(elInput) {
  let _strId = elInput.id;
  let _strType = _strId.indexOf("Edit") == -1 ? "Create" : "Edit";

  let _elCost = document.getElementById("_cost" + _strType + "_input");
  let _elQty = document.getElementById("_qty" + _strType + "_input");
  let _elSum = document.getElementById("_sum" + _strType + "_p");

  _elSum.innerHTML = tabulator(Number(_elCost.value) * Number(_elQty.value));

}

function vVCreateOrder() {
  var _numOrdersLength = ObjOrdersTable.length;

  var _elHeader = document.getElementById("_createOrdersHeader_p");
  _elHeader.innerHTML = "Создать заказ №" + _numOrdersLength;

  vVReGenerateSelect("",ObjManualProductsTable, "_productCreate_select");
  vVModalWindowControll("_createOrders_div","flex");
}

function vQSaveCreate(){
  vVModalWindowControll("_createOrders_div", "none");
  vVModalWindowControll("_modalBack_div", "flex");
  
  var _elHeader = document.getElementById("_createOrdersHeader_p");
  var _elSum = document.getElementById("_sumCreate_p");
  var _elFIO = document.getElementById("_FIOCreate_input");
  var _elTel = document.getElementById("_telCreate_input");
  var _elQty = document.getElementById("_qtyCreate_input");
  var _elCost = document.getElementById("_costCreate_input");
  var _elProduct = document.getElementById("_productCreate_select");
  
  let _date = new Date();

  let _strOrderId = _elHeader.innerText.slice(15, _elHeader.length);
  let _strDateReg = _date.getFullYear() + "-" + (_date.getMonth() + 1) + "-" + _date.getDate(); //2022-04-05
  let _strDateRel = "-";
  let _strStatus = "в обработке";

  let _strParams = "?addIndex=" + _strOrderId + "&FIO=" + _elFIO.value + "&Tel=" + _elTel.value + "&cost=" + _elCost.value.replace(/\s/g, '') + "&dateReg=" + _strDateReg + "&dateRel=" + _strDateRel + "&product=" + (_elProduct.selectedIndex - 1) + "&qty=" + _elQty.value.replace(/\s/g, '') + "&status=" + _strStatus + "&sum=" + _elSum.innerHTML.replace(/\s/g, '');

  var xhttp = new XMLHttpRequest();
   xhttp.addEventListener("load", function() {
      if (xhttp.status === 200) {
          if(xhttp.response != "ошибка"){
              rQGetManualProduct();
          }
          else {
          }
      } else {
          console.log(xhttp);
      }
  });
  xhttp.open("GET", encodeURI( HOST_URL + "updateAddOrder" + _strParams ));
  // xhttp.setRequestHeader("Authorization", "Bearer " + userToken);
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

