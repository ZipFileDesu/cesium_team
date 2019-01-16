var layersAnimationController = (function(){

    var toolbar = document.getElementById('animationToolbar');
    var progressBar = document.getElementById('layersAnimationProgressBar');

    var startPauseStatus = 0; // 0 - Start, 1 - Pause
    function animationStartPauseBtn(self) {
        console.log(self);
        startPauseStatus = !startPauseStatus;
        var names = ['Start','Pause'];
        self.innerHTML = names[+startPauseStatus];
        if (!startPauseStatus){
            layersAnimation.start();
        }
        else {
            layersAnimation.pause();
        }
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

    function changeFrameRate(self) {
        console.log(self.value);
    }

    function initAnimationToolbar(layersList) {
        layersAnimationController.setProgressBarMax(layersList.length);
        layersAnimation.init(viewer, layersList, layersAnimationController.setProgressBarValue,
            function() {
                hideProgressBar();
                showToolbar();
            });
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
    };
})();
