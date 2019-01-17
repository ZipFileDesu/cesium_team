/**
 * Контроллер для работы с анимацией подложек
 * @type {{animationStartPauseBtn, animationStopBtn, animationLeftRightFrame, toggleDirection, changeFrameRate, changeFrameIdx, setFrameIdxValue, initAnimationToolbar, setProgressToolbarValue, showProgressToolbar, hideProgressToolbar, showToolbar, hideToolbar, bindToolbarData, animationStartPauseBtnClick}}
 */
var layersAnimationController = (function(){

    var toolbar = document.getElementById('animationToolbar');
    var progressToolbar = document.getElementById('layerAnimationProgressToolbar');
    var progressBar = document.getElementById('layersAnimationProgressBar');
    var progressStage = document.getElementById('layersAnimationProgressStage');

    var toolbarViewModel;
    var animationStartPauseBtn = document.getElementById('animationStartPauseBtn');
    var animationStartPauseBtnStatus = 0; // 0 - Start, 1 - Pause

    /**
     * При нажатии на кнопку "Play" запускается анимация, а сам текст кнопки меняется на "Pause".
     * При нажатии на "Pause" анимация приостанавливается, а сам текст кнопки меняется на "Play".
     */
    function animationStartPauseBtnClick() {
        if (!animationStartPauseBtnStatus) {
            layersAnimation.start(false);
        }
        else {
            layersAnimation.pause(false);
        }
        animationStartPauseBtnToggle();
    }

    /**
     * Эта функция вызывается из модели "layersAnimation" и изменяет значение кнопки animationStartPauseBtn
     * @param value Новое значение кнопки animationStartPauseBtn
     * @see layersAnimation
     */
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

    /**
     *  При нажатии на кнопку "Stop" анимация останавливается
     */
    function animationStopBtn() {
        layersAnimation.stop();
    }

    /**
     * При нажатии на кнопку "Next" или "Prev" вызывается сдвиг на 1 кадр. Если анимация была активна, она приостанавливается
     * @param shift Направление сдвига кадра (1 или -1)
     */
    function animationLeftRightFrame(shift) {
        layersAnimation.shiftFrame(shift);
    }

    /**
     * При выборе пункта "Reverse", происходит смена направления воспроизведения анимации
     * @param self HTML элемент "Reverse"
     */
    function toggleDirection(self) {
        layersAnimation.toggleDirection(self.checked);
    }

    /**
     * Инициализация элементов надстройки
     */
    function bindToolbarData() {
        toolbarViewModel = {
            frameRate: 10,
            frameIdx: 1
        };
        Cesium.knockout.track(toolbarViewModel);
        Cesium.knockout.applyBindings(toolbarViewModel, toolbar);
    }

    /**
     * Вызывает изменения частоты кадров в секунду (FPS)
     * @param self HTML элемент полосы прокрутки "FrameRate"
     */
    function changeFrameRate(self) {
        // self.value = min(self.max, max(self.min, self.value));
        layersAnimation.changeFrameRate(self.value);
    }

    /**
     * Вызывает изменения текущего кадра
     * @param self HTML элемент полосы прокрутки "Frame Index"
     */
    function changeFrameIdx(self) {
        // self.value = min(self.max, max(self.min, self.value));
        layersAnimation.forceChangeFrameIdx(self.value - 1);
    }

    /**
     * Присваиваем максимальное значение для полосы прокрутки "Frame Index"
     * @param value Новое значение
     */
    function setFrameIdxMax(value) {
        document.getElementById('frameIdxRangeInput').max = value;
    }

    /**
     * Присваиваем значение в элементы "Frame Index"
     * @param value Новое значение
     */
    function setFrameIdxValue(value) {
        document.getElementById('frameIdxRangeInput').value = value + 1;
        document.getElementById('frameIdxTextInput').value = value + 1;
    }

    /**
     * Инициализируем работу анимации
     * @param layersList Список файлов подложек
     */
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

    /**
     * Изменяет значение в "ProgressBar" и опционально изменяет стадию загрузки
     * @param value Новое значение для "ProgressBar"
     * @param stage Новая стадия загрузки
     */
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

    /**
     * Показать "ProgressBar"
     */
    function showProgressToolbar() {
        layersAnimationProgressToolbar.style.display = 'block';
    }

    /**
     * Скрыть "ProgressBar"
     */
    function hideProgressToolbar() {
        layersAnimationProgressToolbar.style.display = 'none';
    }

    /**
     * Показать надстройку анимации
     */
    function showToolbar() {
        toolbar.style.display = 'block';
    }

    /**
     * Спрятать надстройку анимации
     */
    function hideToolbar() {
        toolbar.style.display = 'none';
        layersAnimation.stop();
        // TODO: ??? do we need to clear the added layers, or just hide them?
        layersAnimation.clearAddedLayers();
        // layersAnimation.setLayersAlpha(0);
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
