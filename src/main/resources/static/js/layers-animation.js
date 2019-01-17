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

    function setLayersAlpha(alpha) {
        showFrame();
        for (var i = 0; i < layersArray.length; ++i) {
            layersArray[i].alpha = alpha;
        }
    }

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

    function showFrame(index=currentLayerIdx) {
        console.log('show frame ' + index);
        if (0 <= index && index < layersArray.length) {
            console.log('raise to top frame ' + index);
            viewerImageryLayers.raiseToTop(layersArray[index]);
        }
    }

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

    function forceChangeFrameIdx(index) {
        currentLayerIdx = index;
        showFrame();
    }

    function toggleDirection(direction) {
        stepDirection = -stepDirection;
    }

    function start(throwCallbackFlg = true) {
        pauseAnimationFlg = false;
        stopAnimationFlg = false;
        frameRateChangedFlg = false;
        if (throwCallbackFlg) {
            startPauseCallback('pause');
        }
        animate();
    }

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

    function pause(throwCallbackFlg = true) {
        pauseAnimationFlg = true;
        if (throwCallbackFlg) {
            startPauseCallback('start');
        }
    }

    function changeFrameRate(_frameRate) {
        frameRate = _frameRate;
        frameRateChangedFlg = true;
    }

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
