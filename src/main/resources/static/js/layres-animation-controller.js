var layersAnimationController = (function(){

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

    function animationLeftRightFrame(shift){
        layersAnimation.shiftFrame(shift);
    }

    function toggleDirection(self){
        layersAnimation.toggleDirection(self.checked);
    }

    function changeFrameRate(self){
        console.log(self.value);
    }

    function setProgressBarMax(value){
        document.getElementById("animationLayersProgressBar").max = value;
    }

    function setProgressBarValue(value){
        document.getElementById("animationLayersProgressBar").value = value;
    }

    function showProgressBar(){
        document.getElementById("animationLayersProgressBar").style.display = 'block';
    }

    function hideProgressBar(){
        document.getElementById("animationLayersProgressBar").style.display = 'none';
        toolbarAnimation.style.display = 'block';
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
    };
})();
