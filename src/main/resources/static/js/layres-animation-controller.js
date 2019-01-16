var layersAnimationController = (function(){

    var startPauseStatus = 0; // 0 - Start, 1 - Pause
    function animationStartPauseBtn(self) {
        console.log(self);
        startPauseStatus = !startPauseStatus;
        var names = ['Start','Pause'];
        self.innerHTML = names[+startPauseStatus];
        if (!startPauseStatus){
            //layersAnimation.start();
        }
        else {
            //layersAnimation.stop();
        }
    }

    function animationStopBtn() {
        //layersAnimation.stop();
    }

    function animationLeftRightFrame(shift){
        layersAnimation.shiftFrame(shift);
    }

    function toogleDirection(self){
        layersAnimation.toogleDirection(self.checked);
    }

    function changeFrameRate(self){
        console.log(self.value);
    }

    return {
        animationStartPauseBtn: animationStartPauseBtn,
        animationStopBtn: animationStopBtn,
        animationLeftRightFrame: animationLeftRightFrame,
        toogleDirection: toogleDirection,
        changeFrameRate: changeFrameRate,
    };
})();
