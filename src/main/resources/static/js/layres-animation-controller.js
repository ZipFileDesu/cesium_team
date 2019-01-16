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
        console.log(self.value);
    }

    function initAnimationToolbar(layersList) {
        layersAnimationController.setProgressBarMax(layersList.length);
        layersAnimation.init(viewer, layersList,
            layersAnimationController.setProgressBarValue,
            function() {
                hideProgressBar();
                showToolbar();
            },
            animationStartPauseBtnToggle,
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
    }

    return {
        animationStartPauseBtn: animationStartPauseBtn,
        animationStopBtn: animationStopBtn,
        animationLeftRightFrame: animationLeftRightFrame,
        toggleDirection: toggleDirection,
        changeFrameRate: changeFrameRate,
        setProgressBarMax: setProgressBarMax,
        setProgressBarValue: setProgressBarValue,
        showProgressBar: showProgressBar,
        hideProgressBar: hideProgressBar,
        initAnimationToolbar: initAnimationToolbar,
        showToolbar: showToolbar,
        hideToolbar: hideToolbar,
        bindToolbarData: bindToolbarData,
        animationStartPauseBtnClick: animationStartPauseBtnClick,
    };
})();
