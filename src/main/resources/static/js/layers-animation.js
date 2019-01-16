var layersAnimation = (function() {

    var layersLoadedFlg = false;
    var layersLoadedCnt;

    var stepDirection;
    var currentLayerIdx;

    var pauseAnimationFlg;
    var stopAnimationFlg;
    var animationActiveFlg;
    var pauseCallback;

    var frameRate;
    var frameRateChangedFlg;

    var layersArray;
    var viewerImageryLayers;

    function init(viewer, baseLayers, loadProgressCallback = function(){}, loadFinishCallback = function(){}, _frameRate = 10) {
        stepDirection = 1;
        currentLayerIdx = 0;

        pauseAnimationFlg = false;
        stopAnimationFlg = false;
        animationActiveFlg = false;

        frameRate = _frameRate;
        frameRateChangedFld = false;

        layersArray = [];
        viewerImageryLayers = viewer.imageryLayers;

        if (!layersLoadedFlg) {
            load(baseLayers, loadProgressCallback, loadFinishCallback);
        }
        else {
            setLayersAlpha(1);
            showFrame();
            loadFinishCallback();
        }
    }

    function setLayersAlpha(alpha) {
        showFrame();
        for (var i = 0; i < layersArray.length; ++i) {
            layersArray[i].alpha = alpha;
        }
    }

    function load(baseLayers, loadProgressCallback, loadFinishCallback) {
        layersLoadedCnt = 0;
        layersArray = [];
        viewerImageryLayers = viewer.imageryLayers;

        for (var i = 0; i < baseLayers.length; i++) {
            layersArray.push(viewerImageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
                url: baseLayers[i].path + "/" + baseLayers[i].name,
                rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90)
            })));

            // hide layers while we're loading them
            layersArray[i].alpha = 0;

            (function() {
                var index = i;
                curLayerPromise = layersArray[i].imageryProvider.readyPromise;
                curLayerPromise.then(function() {
                    console.log('layer # ' + index);
                    console.log('total layers loaded: ' + layersLoadedCnt);

                    loadProgressCallback(++layersLoadedCnt);
                    // all images have been loaded
                    if (layersLoadedCnt == baseLayers.length) {
                        setLayersAlpha(1);
                        layersLoadedFlg = true;
                        console.log('all layers have been loaded');
                        loadFinishCallback();
                    }
                });
            })();
        }
    }

    function showFrame(index=currentLayerIdx) {
        console.log('default: ' + currentLayerIdx);
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
    }

    function shiftFrame(shift) {
        callback = function() {
            nextFrame(shift);
            showFrame();
        };

        if (animationActiveFlg) {
            pauseCallback = callback;
            pauseAnimationFlg = true;
        }
        else {
            callback();
        }
    }

    function toggleDirection(direction) {
        stepDirection = -stepDirection;
    }

    function start() {
        pauseAnimationFlg = false;
        stopAnimationFlg = false;
        frameRateChangedFlg = false;
        animate();
    }

    function stop() {
        if (animationActiveFlg) {
            stopAnimationFlg = true;
        }
        else {
            currentLayerIdx = 0;
            showFrame();
        }
    }

    function pause() {
        pauseAnimationFlg = true;
    }

    function changeFrameRate(_frameRate) {
        framerate = _framerate;
        frameRateChangedFlg = true;
    }

    function animate() {
        animationActiveFlg = true;
        var refreshIntervalId = setInterval(function() {
            console.log('inside animation loop, layer # ', currentLayerIdx);

            if (frameRateChangedFlg) {
                clearInterval(refreshIntervalId);
                animationActiveFlg = false;
                animate();
            }
            if (pauseAnimationFlg) {
                clearInterval(refreshIntervalId);
                animationActiveFlg = false;
                if (pauseCallback && typeof pauseCallback === 'function') {
                    pauseCallback();
                    pauseCallback = null;
                }
            }
            if (stopAnimationFlg) {
                clearInterval(refreshIntervalId);
                animationActiveFlg = false;
                currentLayerIdx = 0;
                showFrame();
            }
            nextFrame();
            showFrame();
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
    }
})();
