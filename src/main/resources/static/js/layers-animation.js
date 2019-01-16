var layersAnimation = (function() {

    var stopAnimationFlg = false;

    function stop() {
        stopAnimationFlg = true;
    }

    function start(viewer, baseLayers) {
        var layersArray2 = [];
        var layers2 = viewer.imageryLayers;
        stopAnimationFlg = false;

        var animate = function() {
            console.log("ok, now we're in function 'animate'");

            layers2.raiseToTop(layersArray2[0]);
            for (var i = 0; i < layersArray2.length; ++i) {
                console.log(layersArray2[i].imageryProvider.ready + ' ' + i);
                layersArray2[i].alpha = 1;
            }

            console.log("ok, now we'll animate");

            var counter = 0;
            var refreshIntervalId = setInterval(function() {
                console.log('inside animation loop: ', counter);
                layers2.raiseToTop(layersArray2[counter]);

                counter++;
                if( counter === layersArray2.length-1 ) {
                    counter = 0;
                }
                if ( stopAnimationFlg ) {
                    clearInterval(refreshIntervalId);
                }
            }, 100);
        };

        layersLoaded = 0;
        for (var i = 0; i < baseLayers.length; i++) {
            layersArray2.push(layers2.addImageryProvider(new Cesium.SingleTileImageryProvider({
                url: baseLayers[i].path + "/" + baseLayers[i].name,
                rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90)
            })));

            // hide layers while we're loading them
            layersArray2[i].alpha = 0;

            (function() {
                var index = i;
                curLayerPromise = layersArray2[i].imageryProvider.readyPromise;
                curLayerPromise.then(function() {
                    console.log('layer # ' + index);
                    console.log('total layers loaded: ' + layersLoaded);
                    // run animation when all imagees have been loaded
                    if (++layersLoaded == baseLayers.length) {
                        animate();
                    }
                });
            })();
        }
    }

    return {
        stop: stop,
        start: start,
    }
})();
