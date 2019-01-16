function sleep(ms) {
    ms += new Date().getTime();
    while (new Date() < ms) {
    }
}

// Кросс-браузерное содание объекта XMLHttpRequest
function getXmlHttp(){
    var xmlhttp;
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (E) {
            xmlhttp = false;
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest !== 'undefined') {
        xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
}

function getArtefactsList() {
    // (1) создать объект для запроса к серверу
    var req = getXmlHttp();

    req.onreadystatechange = function() {
        // onreadystatechange активируется при получении ответа сервера

        if (req.readyState === 4) {
            // если запрос закончил выполняться

            //statusElem.innerHTML = req.statusText // показать статус (Not Found, ОК..)

            if(req.status === 200) {
                // если статус 200 (ОК) - выдать ответ пользователю
                alert("Список артефактов получен: " + req.responseText);
                //console.log(req.responseText);
                //startBaseLayerAnimation(JSON.parse(req.responseText));
            }
            // тут можно добавить else с обработкой ошибок запроса
        }
    };

    // (2) задать адрес подключения
    req.open('GET', '/rest/artefacts', true);

    // объект запроса подготовлен: указан адрес и создана функция onreadystatechange
    // для обработки ответа сервера

    // (3)
    req.send(null);  // отослать запрос
}

// javascript-код получения подложек
function getBaseLayerList(callback) {
    // (1) создать объект для запроса к серверу
    var req = getXmlHttp();

    req.onreadystatechange = function() {
        // onreadystatechange активируется при получении ответа сервера

        if (req.readyState === 4) {
            // если запрос закончил выполняться

            //statusElem.innerHTML = req.statusText // показать статус (Not Found, ОК..)

            if(req.status === 200) {
                // если статус 200 (ОК) - выдать ответ пользователю
                //alert("Ответ сервера: " + req.responseText);
                //console.log(req.responseText);
                callback(viewer, JSON.parse(req.responseText));
            }
            // тут можно добавить else с обработкой ошибок запроса
        }
    };

    // (2) задать адрес подключения
    req.open('GET', '/rest/basemap', true);

    // объект запроса подготовлен: указан адрес и создана функция onreadystatechange
    // для обработки ответа сервера

    // (3)
    req.send(null);  // отослать запрос
}

// Grant your CesiumJS app access to your ion assets
// This is your actual default access token, you can copy/paste this directly into your app code
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjOGZiMDIxMi02NzYwLTQ5MzgtOTk0ZC02YTJiYWU5MTQyODUiLCJpZCI6MjE0MSwiaWF0IjoxNTMxNzI3NzUzfQ.cRJYZ0l7AOiA2BcvqzY-Z4kIJcyZd2G-ygod2Dw9ZtA';
var viewer = new Cesium.Viewer("cesiumContainer");

function addPoint() {
    Sandcastle.declare(addPoint);

    viewer.entities.add({
        position : Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
        point : {
            pixelSize : 10,
            color : Cesium.Color.YELLOW
        }
    });
    viewer.entities.add({
        position : Cesium.Cartesian3.fromDegrees(-80.50, 35.14),
        point : {
            color : Cesium.Color.BLUE,
            pixelSize : 10
        }
    });
    viewer.entities.add({
        position : Cesium.Cartesian3.fromDegrees(-80.12, 25.46),
        point : {
            color : Cesium.Color.LIME,
            pixelSize : 10
        }
    });
}

addPoint();

Sandcastle.addToolbarMenu([{
    text : 'Add point',
    onselect : function() {
        addPoint();
        Sandcastle.highlight(addPoint);
    }
}, {
    text : 'Start animation',
    onselect : function() {
        addPoint();
        layersAnimation.start();
        // getBaseLayerList();
        // Sandcastle.highlight(getBaseLayerList);
    }
}, {
    text : 'Init animation',
    onselect : function() {
        addPoint();
        getBaseLayerList(layersAnimation.init);
        // Sandcastle.highlight(getBaseLayerList);
    }
}, {
    text : 'Get Artifacts',
    onselect : function ( ) {
        getArtefactsList();
        Sandcastle.highlight(getArtefactsList);
    }
}, {
    text : 'Stop Animation',
    onselect : function ( ) {
        layersAnimation.stop();
        // Sandcastle.highlight(stopAnimation);
    }
}]);

Sandcastle.reset = function () {
    viewer.entities.removeAll();
};

//getBaseLayerList();