/**
 * Модель для работы с анимацей
 * @type {{init, start, stop, pause, shiftFrame, toggleDirection, changeFrameRate, forceChangeFrameIdx, setLayersAlpha, clearAddedLayers}}
 */
var layersAnimation = (function() {

    var stepDirection;
    var currentLayerIdx;

    var pauseAnimationFlg;
    var stopAnimationFlg;
    var animationActiveFlg;
    var pauseCallback;
    var startPauseCallback;

    var frameRate;
    var frameRateChangedFlg;
    var frameIdxCallback;

    var layersArray;
    var viewerImageryLayers;
    var fileToLoadedImg = {};
    var baseLayers


    /**
     * Инициализирует модель
     * @param viewer Cesium Viewer
     * @param baseLayers Список подложек
     * @param loadProgressCallback Функция, вызываемая при обновлении загрузки
     * @param loadFinishCallback Функция, вызываемая при завершении загрузки
     * @param _startPauseCallback Функция, которая вызовется при паузе анимации
     * @param _frameIdxCallback Функция, которая вызывается при смене кадра. Вернёт новый кадр
     * @param _frameRate Количество кадров в секунду
     */
    function init(viewer, baseLayers, loadProgressCallback = function(){}, loadFinishCallback = function(){},
                  _startPauseCallback = function(){}, _frameIdxCallback = function(){}, _frameRate = 10) {

        pauseAnimationFlg = false;
        stopAnimationFlg = false;
        animationActiveFlg = false;
        startPauseCallback = _startPauseCallback;

        frameRate = _frameRate;
        frameRateChangedFld = false;
        frameIdxCallback = _frameIdxCallback;

        console.log('layersAnimation init');
        console.log('viewerImageryLayers' + viewerImageryLayers);
        viewerImageryLayers = viewer;
        load(baseLayers, loadProgressCallback, loadFinishCallback);
    }

    /**
     * Очистка памяти. Удаляет добавленные подложки
     */
    function clearAddedLayers() {
        console.log('clearAddedLayers');
        console.log(viewerImageryLayers);

        for (var i = 0; i < layersArray.length; ++i) {
            viewerImageryLayers.remove(layersArray[i]);
        }

        console.log('--- CLEARED');
        console.log(viewerImageryLayers);
        console.log(layersArray);

        layersArray = [];
    }

    /**
     * Присваивает значение alpha (прозрачности) всем подложкам
     * @param alpha Новое значение
     */
    function setLayersAlpha(alpha) {
        showFrame();
        for (var i = 0; i < layersArray.length; ++i) {
            layersArray[i].alpha = alpha;
        }
    }

    /**
     * Ассинхронно загружает изображения подложек
     * @param baseLayers Список подложек
     * @param loadProgressCallback Функция, вызываемая при обновлении загрузки
     * @param loadFinishCallback Функция, вызываемая при завершении загрузки
     */
    function loadImages(baseLayers, loadProgressCallback, loadFinishCallback) {
        var imagesLoadedCnt = 0;
        loadProgressCallback(0, 'load_images');
        console.log(fileToLoadedImg);

        for (var i = 0; i < baseLayers.length; i++) {
            var filePath = baseLayers[i].path + "/" + baseLayers[i].name;
            if (!(filePath in fileToLoadedImg)) {
                console.log('file is not in dictionary ' + filePath);
                var curResource = new Cesium.Resource({
                    url: baseLayers[i].path + "/" + baseLayers[i].name,
                    preferBlob: false
                });

                (function () {
                    var index = i;
                    var curFilePath = filePath;

                    curResource.fetchImage().then(function (image) {
                        fileToLoadedImg[curFilePath] = image;
                        ++imagesLoadedCnt;
                        console.log('load file # ' + index);
                        console.log('total images loaded: ' + imagesLoadedCnt);

                        loadProgressCallback(100 * imagesLoadedCnt / baseLayers.length);

                        // all images have been loaded
                        if (imagesLoadedCnt == baseLayers.length) {
                            console.log('all images have been loaded');
                            loadFinishCallback();
                        }
                    });
                })();
            } else {
                ++imagesLoadedCnt;
                console.log('image taken from cash: ' + imagesLoadedCnt);
                console.log('total images loaded: ' + imagesLoadedCnt);
                loadProgressCallback(100 * imagesLoadedCnt / baseLayers.length);

                if (imagesLoadedCnt == baseLayers.length) {
                    loadFinishCallback();
                }
            }
        }
    }

    /**
     * Ассинхронно добавляет подложки на карту
     * @param baseLayers Список подложек
     * @param loadProgressCallback Функция, вызываемая при обновлении загрузки
     * @param loadFinishCallback Функция, вызываемая при завершении загрузки
     */
    function loadLayers(baseLayers, loadProgressCallback, loadFinishCallback) {
        var layersAddedCnt = 0;
        loadProgressCallback(0, 'add_layers');

        for (var i = 0; i < baseLayers.length; i++) {
            var filePath = baseLayers[i].path + "/" + baseLayers[i].name;
            var imgSrc = fileToLoadedImg[filePath].src;

            layersArray.push(viewerImageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
                url: imgSrc,
                rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90)
            })));

            // hide layers while we're loading them
            layersArray[i].alpha = 0;

            (function() {
                var index = i;
                layersArray[i].imageryProvider.readyPromise.then(function() {
                    ++layersAddedCnt;
                    console.log('add layer # ' + index);
                    console.log('total layers added: ' + layersAddedCnt);

                    loadProgressCallback(100 * layersAddedCnt  / baseLayers.length);

                    // all images have been loaded
                    if (layersAddedCnt == baseLayers.length) {
                        setLayersAlpha(1);
                        console.log('all layers have been added');
                        console.log(viewerImageryLayers);
                        loadFinishCallback();
                    }
                });
            })();
        }
    }

    /**
     * Ассинхронно загружает и добавляет подложки
     * @param baseLayers Список подложек
     * @param loadProgressCallback Функция, вызываемая при обновлении загрузки
     * @param loadFinishCallback Функция, вызываемая при завершении загрузки
     */
    function load(baseLayers, loadProgressCallback, loadFinishCallback) {
        layersArray = [];
        viewerImageryLayers = viewer.imageryLayers;

        stepDirection = 1;
        currentLayerIdx = 0;

        loadImages(baseLayers, loadProgressCallback,
            function() {
                loadLayers(baseLayers, loadProgressCallback, loadFinishCallback);
            });
    }

    /**
     * Показывает кадр
     * @param index Индекс (номер) кадра
     */
    function showFrame(index=currentLayerIdx) {
        console.log('show frame ' + index);
        if (0 <= index && index < layersArray.length) {
            console.log('raise to top frame ' + index);
            viewerImageryLayers.raiseToTop(layersArray[index]);
        }
    }

    /**
     * Сменя кадра
     * @param shift Направление смены кадра
     */
    function nextFrame(shift = 1) {
        currentLayerIdx += shift * stepDirection;
        if (currentLayerIdx === layersArray.length) {
            currentLayerIdx = 0;
        }
        if (currentLayerIdx < 0) {
            currentLayerIdx = layersArray.length - 1;
        }
        frameIdxCallback(currentLayerIdx);
    }

    /**
     * Сдвигает один кадр. В случае активной анимации, останавливает анимацию.
     * @param shift Направление смены кадра
     */
    function shiftFrame(shift) {
        callback = function() {
            nextFrame(shift);
            showFrame();
        };
        if (animationActiveFlg) {
            pauseCallback = callback;
            pause();
        }
        else {
            callback();
        }
    }

    /**
     * Меняет номер кадра
     * @param index Индекс (номер) кадра
     */
    function forceChangeFrameIdx(index) {
        currentLayerIdx = index;
        showFrame();
    }

    /**
     * Смена направления воспроизведения
     * @param direction Новое направление
     */
    function toggleDirection(direction) {
        stepDirection = -stepDirection;
    }

    /**
     * Начинает воспроизведение анимации
     * @param throwCallbackFlg Показывает, нужно ли менять состояние кнопки "Start/Pause"
     */
    function start(throwCallbackFlg = true) {
        pauseAnimationFlg = false;
        stopAnimationFlg = false;
        frameRateChangedFlg = false;
        if (throwCallbackFlg) {
            startPauseCallback('pause');
        }
        animate();
    }

    /**
     * Останавливает анимацию и возвращает на первый кадр
     */
    function stop() {
        if (animationActiveFlg) {
            stopAnimationFlg = true;
            startPauseCallback('start');
        }
        else {
            currentLayerIdx = 0;
            frameIdxCallback(0);
            showFrame();
        }
    }

    /**
     * Приостанавливает анимацию
     * @param throwCallbackFlg Показывает, нужно ли менять состояние кнопки "Start/Pause"
     */
    function pause(throwCallbackFlg = true) {
        pauseAnimationFlg = true;
        if (throwCallbackFlg) {
            startPauseCallback('start');
        }
    }

    /**
     * Меняем количество кадров в секунду (FPS)
     * @param _frameRate Новое значение количество кадров в секунду (FPS)
     */
    function changeFrameRate(_frameRate) {
        frameRate = _frameRate;
        frameRateChangedFlg = true;
    }

    /**
     * Запускаем анимацию. Эта функция, которая будет вызывать смену кадров в зависимости от FPS
     * @see nextFrame
     * @see showFrame
     */
    function animate() {
        animationActiveFlg = true;
        var refreshIntervalId = setInterval(function() {
            console.log('inside animation loop, layer # ', currentLayerIdx);

            if (frameRateChangedFlg) {
                clearInterval(refreshIntervalId);
                animationActiveFlg = false;
                frameRateChangedFlg = false;
                animate();
            }
            else if (pauseAnimationFlg) {
                clearInterval(refreshIntervalId);
                animationActiveFlg = false;
                if (pauseCallback && typeof pauseCallback === 'function') {
                    pauseCallback();
                    pauseCallback = null;
                }
            }
            else if (stopAnimationFlg) {
                clearInterval(refreshIntervalId);
                animationActiveFlg = false;
                currentLayerIdx = 0;
                frameIdxCallback(0);
                showFrame();
            }
            else {
                nextFrame();
                showFrame();
            }
        }, 1000 / frameRate);
    }

    return {
        init: init,
        start: start,
        stop: stop,
        pause: pause,

        shiftFrame: shiftFrame,
        toggleDirection: toggleDirection,
        changeFrameRate: changeFrameRate,
        forceChangeFrameIdx: forceChangeFrameIdx,
        setLayersAlpha: setLayersAlpha,
        clearAddedLayers: clearAddedLayers,
    }
})();
