var layersAnimationController = (function(){

    var toolbar = document.getElementById('animationToolbar');
    var progressToolbar = document.getElementById('layerAnimationProgressToolbar');
    var progressBar = document.getElementById('layersAnimationProgressBar');
    var progressStage = document.getElementById('layersAnimationProgressStage');

    var toolbarViewModel;
    var animationStartPauseBtn = document.getElementById('animationStartPauseBtn');
    var animationStartPauseBtnStatus = 0; // 0 - Start, 1 - Pause

    function animationStartPauseBtnClick() {
        if (!animationStartPauseBtnStatus) {
            layersAnimation.start(false);
        }
        else {
            layersAnimation.pause(false);
        }
        animationStartPauseBtnToggle();
    }

    function animationStartPauseBtnToggle(value) {
        console.log('startPauseCallback, value: ' + value);
        if (value) {
            animationStartPauseBtnStatus = (value == 'start' ? 0 : 1);
        }
        else {
            animationStartPauseBtnStatus = !animationStartPauseBtnStatus;
        }
        var names = ['Start', 'Pause'];
        animationStartPauseBtn.innerHTML = names[+animationStartPauseBtnStatus];
    }

    function animationStopBtn() {
        layersAnimation.stop();
    }

    function animationLeftRightFrame(shift) {
        layersAnimation.shiftFrame(shift);
    }

    function toggleDirection(self) {
        layersAnimation.toggleDirection(self.checked);
    }

    function bindToolbarData() {
        toolbarViewModel = {
            frameRate: 10,
            frameIdx: 1
        };
        Cesium.knockout.track(toolbarViewModel);
        Cesium.knockout.applyBindings(toolbarViewModel, toolbar);
    }

    function changeFrameRate(self) {
        layersAnimation.changeFrameRate(self.value);
        // console.log(self.value);
    }

    function changeFrameIdx(self) {
        layersAnimation.forceChangeFrameIdx(self.value - 1);
    }

    function setFrameIdxMax(value) {
        document.getElementById('frameIdxRangeInput').max = value;
    }

    function setFrameIdxValue(value) {
        document.getElementById('frameIdxRangeInput').value = value + 1;
        document.getElementById('frameIdxTextInput').value = value + 1;
    }

    function initAnimationToolbar(layersList) {
        console.log(layersList);
        setFrameIdxMax(layersList.length);

        layersAnimation.init(viewer, layersList,
            setProgressToolbarValue,
            function() {
                hideProgressToolbar();
                showToolbar();
            },
            animationStartPauseBtnToggle,
            setFrameIdxValue,
            toolbarViewModel.frameRate);
    }

    function setProgressToolbarValue(value, stage) {
        progressBar.value = value;
        if (stage) {
            var stageToCaption = {
                'load_images': 'Loading images',
                'add_layers': 'Adding layers to the map',
            };
            progressStage.innerHTML = stageToCaption[stage];
        }
    }

    function showProgressToolbar() {
        layersAnimationProgressToolbar.style.display = 'block';
    }

    function hideProgressToolbar() {
        layersAnimationProgressToolbar.style.display = 'none';
    }

    function showToolbar() {
        toolbar.style.display = 'block';
    }

    function hideToolbar() {
        toolbar.style.display = 'none';
        layersAnimation.stop();
        // TODO: ??? do we need to clear the added layers, or just hide them?
        layersAnimation.setLayersAlpha(0);
    }

    return {
        animationStartPauseBtn: animationStartPauseBtn,
        animationStopBtn: animationStopBtn,
        animationLeftRightFrame: animationLeftRightFrame,
        toggleDirection: toggleDirection,
        changeFrameRate: changeFrameRate,
        changeFrameIdx: changeFrameIdx,
        setFrameIdxValue: setFrameIdxValue,

        initAnimationToolbar: initAnimationToolbar,
        setProgressToolbarValue: setProgressToolbarValue,
        showProgressToolbar: showProgressToolbar,
        hideProgressToolbar: hideProgressToolbar,
        showToolbar: showToolbar,
        hideToolbar: hideToolbar,
        bindToolbarData: bindToolbarData,
        animationStartPauseBtnClick: animationStartPauseBtnClick,
    };
})();
