var layersAnimationController = (function(){

    var toolbar = document.getElementById('animationToolbar');
    var progressBar = document.getElementById('layersAnimationProgressBar');
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
        setProgressBarMax(layersList.length);
        setFrameIdxMax(layersList.length);

        layersAnimation.init(viewer, layersList,
            layersAnimationController.setProgressBarValue,
            function() {
                hideProgressBar();
                showToolbar();
            },
            animationStartPauseBtnToggle,
            setFrameIdxValue,
            toolbarViewModel.frameRate);
    }

    function setProgressBarMax(value) {
        progressBar.max = value;
    }

    function setProgressBarValue(value) {
        progressBar.value = value;
    }

    function showProgressBar() {
        progressBar.style.display = 'block';
    }

    function hideProgressBar() {
        progressBar.style.display = 'none';
    }

    function showToolbar() {
        toolbar.style.display = 'block';
    }

    function hideToolbar() {
        toolbar.style.display = 'none';
        layersAnimation.stop();
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
        setProgressBarMax: setProgressBarMax,
        setProgressBarValue: setProgressBarValue,
        showProgressBar: showProgressBar,
        hideProgressBar: hideProgressBar,
        showToolbar: showToolbar,
        hideToolbar: hideToolbar,
        bindToolbarData: bindToolbarData,
        animationStartPauseBtnClick: animationStartPauseBtnClick,
    };
})();
