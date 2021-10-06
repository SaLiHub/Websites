export default function createHorizontalSlider() {
  const sliderContainer = document.querySelector('#sliderContainer'),
    sliderWrapper = document.querySelector('#sliderWrapper'),
    slides = document.querySelectorAll('.slider-slide'),
    sliderPagination = document.querySelector('#sliderPagination'),
    counter = document.querySelector('#countNumber');

  let wasPressed = false,
    slidePosition = 0,
    indexOfActiveSlide = 0,
    startPointOfDragging,
    slideWidth,
    bullets,
    timeOfStartDragging,
    draggingStopped;

  (function init() {
    initBullets();
    setCurrentSlideNumber();
    addActiveSlideAndBullet(indexOfActiveSlide);
    initEventListeners();
    setSizeOfSlide();
    addTransparentHighlight();
  })();

  function addTransparentHighlight() {
    sliderContainer.classList.add('highlight-transparent');
  }

  function setCurrentSlideNumber() {
    const numberOfSlide = indexOfActiveSlide + 1;
    if (numberOfSlide >= 10) {
      counter.innerText = `${numberOfSlide}`;
    } else {
      counter.innerText = `0${numberOfSlide}`;
    }
  }

  function setSizeOfSlide() {
    slideWidth = sliderContainer.offsetWidth;
  }

  function initBullets() {
    for (let i = 0; i < slides.length; i++) {
      createBullet(i);
    }

    bullets = document.querySelectorAll('.slider-pagination-bullet');
  }

  function triggerBullets(e) {
    if (e.target.classList.contains('slider-pagination-bullet')) {
      const numberBulletIndex = Number(e.target.dataset.bulletIndex);
      bulletClickTriger(numberBulletIndex);
    }
  }
  function createBullet(index) {
    let el = document.createElement('span');
    el.classList.add('slider-pagination-bullet');
    el.dataset.bulletIndex = index;
    sliderPagination.appendChild(el);
  }

  function changeSliderPosition(indexOfNewActiveSlide) {
    setSliderPosition(indexOfNewActiveSlide);
    // add transition durration durring changing slides
    startSliding();
  }

  function startSliding() {
    sliderWrapper.style.transitionDuration = '300ms';
    addSlidingStatus();
  }

  function endSliding() {
    sliderWrapper.style.transitionDuration = '0ms';
    removeSlidingStatus();
  }

  function bulletClickTriger(indexOfNewActiveSlide) {
    changeSliderPosition(indexOfNewActiveSlide);
    setNewActiveSlideAndBullet(indexOfNewActiveSlide);
    setCurrentSlideNumber();
  }

  function setSliderPosition(indexOfSlide, draggedDistance = 0, slowingCoeff = 1) {
    slidePosition = slideWidth * indexOfSlide + draggedDistance / slowingCoeff;
    sliderWrapper.style.transform = `translate3d(${-slidePosition}px, 0, 0)`;
  }

  function removePrevActiveSlideAndBullet(i) {
    slides[i].classList.remove('active-slide');
    bullets[i].classList.remove('active-bullet');
  }

  function addActiveSlideAndBullet(i) {
    slides[i].classList.add('active-slide');
    bullets[i].classList.add('active-bullet');
  }

  function setNewActiveSlideAndBullet(newIndex, prevIndex = indexOfActiveSlide) {
    removePrevActiveSlideAndBullet(prevIndex);
    addActiveSlideAndBullet(newIndex);
    setNewIndexOfActiveSlide(newIndex);
  }

  function setNewIndexOfActiveSlide(newIndex) {
    indexOfActiveSlide = newIndex;
  }

  function isSliding() {
    return sliderWrapper.classList.contains('sliding');
  }

  function startOfDragging(e) {
    // if click was on pagination bar or right click was used
    // then slider-dragging is not getting triggered
    const elementsClickedId = [e.target.id, e.target.parentElement.id];
    if (elementsClickedId.includes('sliderPagination') || e.buttons === 2 || isSliding()) return;

    wasPressed = true;
    startPointOfDragging = e.pageX;
    timeOfStartDragging = new Date().getTime();
    endSliding();
    e.preventDefault();
  }

  function dragging(e) {
    // if user move mouse without wasPressed slider won't get triggered
    if (!wasPressed) return;

    const currentPointOfDragging = e.pageX,
      draggedDistance = startPointOfDragging - currentPointOfDragging,
      slowingCoeff = 2;
    if (draggedDistance < 0) {
      draggingUp(draggedDistance, slowingCoeff);
    } else if (draggedDistance > 0) {
      draggingDown(draggedDistance, slowingCoeff);
    }
  }

  function draggingUp(draggedDistance, slowingCoeff) {
    if (isFirstSlide()) {
      setSliderPosition(indexOfActiveSlide, draggedDistance, slowingCoeff);
    } else {
      setSliderPosition(indexOfActiveSlide, draggedDistance);
    }
  }
  function draggingDown(draggedDistance, slowingCoeff) {
    if (isLastSlide()) {
      setSliderPosition(indexOfActiveSlide, draggedDistance, slowingCoeff);
    } else {
      setSliderPosition(indexOfActiveSlide, draggedDistance);
    }
  }

  function endOfDragging(e) {
    if (!wasPressed) return;
    wasPressed = false;

    const endPointOfDragging = e.pageX,
      draggedDistance = startPointOfDragging - endPointOfDragging;

    draggingStopped = new Date().getTime();

    // if user dragged in vertical direction
    // then slider doesn't get triggered
    if (slidingWasCanceled(endPointOfDragging)) return;
    // if not choose next slider according to direction
    else chooseNextSlide(draggedDistance, timeOfDragging());
  }

  function slidingWasCanceled(endPointOfDragging) {
    return endPointOfDragging === 0 && timeOfDragging() < 100 ? true : false;
  }

  function timeOfDragging() {
    return draggingStopped - timeOfStartDragging;
  }

  function chooseNextSlide(draggedDistance, timeOfDraging) {
    if (draggedDistance === 0) {
      return;
    } else if (timeLimitBreached(timeOfDraging)) {
      goToCurrentSlide();
      startSliding();
      return;
    } else if (directionOfDragging(draggedDistance) === 'left') {
      isFirstSlide() ? goToCurrentSlide() : goToPrevSlide();
      startSliding();
      return;
    } else if (directionOfDragging(draggedDistance) === 'right') {
      isLastSlide() ? goToCurrentSlide() : goToNextSlide();
      startSliding();
      return;
    }
  }

  function directionOfDragging(draggedDistance) {
    return draggedDistance > 0 ? 'right' : 'left';
  }

  function timeLimitBreached(timeOfDraging) {
    return timeOfDraging > 250 ? true : false;
  }

  function addSlidingStatus() {
    sliderWrapper.classList.add('sliding');
  }

  function removeSlidingStatus() {
    sliderWrapper.classList.remove('sliding');
  }

  function isFirstSlide() {
    return indexOfActiveSlide === 0;
  }

  function isLastSlide() {
    return indexOfActiveSlide === slides.length - 1;
  }

  function goToCurrentSlide() {
    setSliderPosition(indexOfActiveSlide);
  }

  function goToPrevSlide() {
    const newActiveSlide = indexOfActiveSlide - 1,
      prevActiveSlide = indexOfActiveSlide;
    setSliderPosition(newActiveSlide);
    setNewActiveSlideAndBullet(newActiveSlide, prevActiveSlide);

    setCurrentSlideNumber();
  }

  function goToNextSlide() {
    const newActiveSlide = indexOfActiveSlide + 1,
      prevActiveSlide = indexOfActiveSlide;
    setSliderPosition(newActiveSlide);
    setNewActiveSlideAndBullet(newActiveSlide, prevActiveSlide);

    setCurrentSlideNumber();
  }

  function initEventListeners() {
    if (window.PointerEvent) {
      sliderContainer.addEventListener('pointerdown', startOfDragging);
      sliderContainer.addEventListener('pointermove', dragging);
      sliderContainer.addEventListener('pointerup', endOfDragging);
      sliderContainer.addEventListener('pointercancel', endOfDragging);

      //

      sliderContainer.addEventListener('mouseleave', endOfDragging);
    } else {
      sliderContainer.addEventListener('mousedown', startOfDragging);
      sliderContainer.addEventListener('mousemove', dragging);
      sliderContainer.addEventListener('mouseup', endOfDragging);
      sliderContainer.addEventListener('mouseleave', endOfDragging);

      sliderContainer.addEventListener('touchstart', startOfDragging);
      sliderContainer.addEventListener('touchmove', dragging);
      sliderContainer.addEventListener('touchcancel', endOfDragging);
      sliderContainer.addEventListener('touchend', endOfDragging);
    }
    // set transitionDuration as 0ms when sliding transition ended
    // so we can drag without any transition
    sliderWrapper.addEventListener('transitionend', endSliding);
    // change size of slide according to the size of viewport
    window.addEventListener('resize', () => {
      setSizeOfSlide();
      setSliderPosition(indexOfActiveSlide);
    });
    // listen click on each bulet
    sliderPagination.addEventListener('click', triggerBullets);
  }
}