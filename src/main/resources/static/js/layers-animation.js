var layersAnimation = (function() {

    var layersLoadedFlg = false;
    var layersLoadedCnt;

    var stepDirection;
    var currentLayerIdx;
    var pauseAnimationFlg;
    var stopAnimationFlg;

    var frameRate;
    var frameRateChangedFlg;

    var layersArray;
    var viewerImageryLayers;

    function init(viewer, baseLayers, _frameRate = 10, callback = function(){}) {
        layersArray = [];
        viewerImageryLayers = viewer.imageryLayers;

        currentLayerIdx = 0;
        stepDirection = 1;
        pauseAnimationFlg = false;

        frameRate = _frameRate;
        frameRateChangedFld = false;

        if (!layersLoadedFlg) {
            load(baseLayers, callback);
        }
        else {
            setLayersAlpha(1);
            showFrame();
            callback();
        }
    }

    function setLayersAlpha(alpha) {
        showFrame();
        for (var i = 0; i < layersArray.length; ++i) {
            layersArray[i].alpha = alpha;
        }
    }

    function load(baseLayers, callback) {
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

                    // all images have been loaded
                    if (++layersLoadedCnt == baseLayers.length) {
                        console.log('all layers have been loaded');
                        setLayersAlpha(1);
                        console.log('all layers have been loaded');
                        layersLoadedFlg = true;
                        console.log('all layers have been loaded');
                        callback();
                        console.log('all layers have been loaded');
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

    function nextFrame() {
        currentLayerIdx += stepDirection;
        if (currentLayerIdx === layersArray.length) {
            currentLayerIdx = 0;
        }
        if (currentLayerIdx < 0) {
            currentLayerIdx = layersArray.length - 1;
        }
    }

    //
    function shiftFrame(shift) {
        pauseAnimationFlg = true;
    }

    function toggleDirection(direction) {
        stepDirection = -stepDirection;
    }

    function start() {
        pauseAnimationFlg = false;
        stopAnimationFlg = false;
        animate();
    }

    function stop() {
        stopAnimationFlg = true;
    }

    function pause() {
        pauseAnimationFlg = true;
    }

    function changeFrameRate(_frameRate) {
        framerate = _framerate;
        frameRateChangedFlg = true;
    }

    function animate() {
        var refreshIntervalId = setInterval(function() {
            console.log('inside animation loop, layer # ', currentLayerIdx);

            if (frameRateChangedFlg) {
                clearInterval(refreshIntervalId);
                animate();
            }
            if (pauseAnimationFlg) {
                clearInterval(refreshIntervalId);
            }
            if (stopAnimationFlg) {
                clearInterval(refreshIntervalId);
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
    }
})();
