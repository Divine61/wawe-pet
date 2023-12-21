"use strict"

// Порог ширины экрана для планшетов
const widthTabletVersion = 1200;

// Все имеющиеся изображения на сайте
let allImages;
// Видимые изображения
let visibleImages;
// Блок просмотра изображений в полноэкранном режиме
let boxGallery;
// id интервала автослайдера
let launchIntervalId;
// Скорость автослайдера в млсек
let timerSlider = 800;
// Порог соотношения сторон для определения ландшафтного изображения, 
// свыше порогового значения - портретные
const aspectRatioBar = 0.91;


window.addEventListener(`load`, () => {
  // Открыть меню в режиме mobile
  openMenu();
  // Настройка секции галереи
  settingGallery();
  // Запустить видео
  launchVideo();
  // Чередовать слайды в Блоге
  switchSlides();
  // Настройка формы обратной связи
  settingForm();
})

// Открыть меню в режиме mobile
function openMenu() {
  const menuList = document.querySelector(`.header__list-items`);
  const btnMenu = document.querySelector(`.btn-menu`);
  const headerMenuLinks = [...menuList.querySelectorAll(`.menu__link`)];
  btnMenu.addEventListener(`click`, () => {
    menuList.classList.add(`menu__list-active`);
  })
  headerMenuLinks.forEach(link => {
    link.addEventListener(`click`, () => {
      menuList.classList.remove(`menu__list-active`);
    })
  })
  document.addEventListener(`click`, event => {
    if (!event.target.classList.contains(`menu__list-active`) && !event.target.classList.contains(`btn-menu`)) {
      menuList.classList.remove(`menu__list-active`);
    }
  })
}

// ---------- Секция галереи ----------

// Настройка секции галереи
function settingGallery() {
  const gallery = document.querySelector(`.gallery`);
  const menuGallery = gallery.querySelector(`.menu__list`);
  const wrapGallery = gallery.querySelector(`.wrap-gallery`);
  const btnShowGallery = gallery.querySelector(`.btn`);
  let activeCategory;
  // Составление коллекции из видимых картинок
  allImages = creatArrOpenImg(gallery);
  visibleImages = allImages;
  // Создание массива категорий изображений
  let listOfCategories = creatArrCategoty(allImages);
  // Перебор всех изображений, раздатчик кнопок "открыть на полный экран"
  customizeImages(gallery, menuGallery);
  // Создать меню для галереи под категории имеющихся фото
  const updateMenu = creatMenuGallery(menuGallery, listOfCategories);
  // Выбор нужных фото по категории
  activeCategory = choseImgsForCategory(gallery, updateMenu, activeCategory);
  // Подгрузить все изображения с сайта
  uploadImages(btnShowGallery, wrapGallery, gallery, menuGallery);
}

// Перебор всех изображений, раздатчик кнопок "открыть на полный экран"
function customizeImages(gallery, menuGallery) {
  allImages.forEach((img, index) => {
    // Вычислить пропорции изображений
    calcAspectRatio(img) ? img.style.gridColumn = `span 2` : false;
    // Раздатчик кликов на изображения
    img.addEventListener(`click`, () => {
      // Настройка блока полноэкранного просмотра изображения
      !gallery.querySelector(`.box-gallery`) ? settingBoxGallery(menuGallery) : false;
      // Открыть изображение на полный экран
      openImgToFull(index);
      document.addEventListener(`keydown`, btn => {
        (btn.key === `Tab` && boxGallery.dataset.visible === `on`) ? btn.preventDefault() : false;
      });
    });
  });
}

// Создание массива категорий изображений
function creatArrCategoty(imgCarts) {
  let listOfCategories = [];
  imgCarts.forEach(img => {
    let currentCategories = img.dataset.category;
    if (!listOfCategories.includes(currentCategories)) {
      listOfCategories.push(currentCategories);
      return listOfCategories
    }
  })
  return listOfCategories
}

// Составление коллекции из видимых картинок
function creatArrOpenImg(section) {
  allImages = [...section.querySelectorAll(`.inner-gallery`)];
  return allImages.filter(img => img.dataset.visible === `on`);
}

// Вычислить пропорции изображений
function calcAspectRatio(imgCart) {
  const widthImg = imgCart.querySelector(`.content-img`).naturalWidth;
  const heightImg = imgCart.querySelector(`.content-img`).naturalHeight;
  const aspectRatio = heightImg / widthImg;
  return aspectRatio < `${aspectRatioBar}` ? true : false;
}

// Настройка блока полноэкранного просмотра изображения
function settingBoxGallery(menuGallery) {
  // Создание HTML конструкции блока полноэкранного просмотра изображения
  let nodeConstructor = creatBoxGallery();
  boxGallery = nodeConstructor;
  menuGallery.after(boxGallery);
  // Включить автослайд
  btnLaunchSlider(boxGallery);
  // Чередовать изображения
  switchImages(boxGallery);
  // Закрыть полноэкранный просмотр изображенния
  closeImgFull(boxGallery);
}

// Создание HTML конструкции блока полноэкранного просмотра изображения
function creatBoxGallery() {
  const boxGallery = document.createElement(`div`);
  boxGallery.className = `inner-wrap box-gallery`;
  const boxDecorInfobar = document.createElement(`div`);
  const boxDecorToolbar = document.createElement(`div`);
  boxDecorInfobar.className = `box-decor decor-infobar`;
  boxDecorToolbar.className = `box-decor decor-toolbar`;
  const visuallyHidden = document.createElement(`span`);
  visuallyHidden.className = `visually-hidden`;
  const btnLaunch = document.createElement(`button`);
  btnLaunch.prepend(visuallyHidden);
  const btnClose = btnLaunch.cloneNode(true);
  const btnBack = btnLaunch.cloneNode(true);
  const btnNext = btnLaunch.cloneNode(true);
  btnLaunch.className = `toolbar-btn btn-img__launch`;
  btnClose.className = `toolbar-btn btn-img__close`;
  btnBack.className = `navigation-btn navigation-btn__back`;
  btnNext.className = `navigation-btn navigation-btn__next`;
  btnLaunch.prepend(`\u{25ba}`);
  btnClose.prepend(`\u{2613}`);
  btnLaunch.querySelector(`span`).textContent = `Launch slider`;
  btnClose.querySelector(`span`).textContent = `Close slider`;
  btnBack.querySelector(`span`).textContent = `Back`;
  btnNext.querySelector(`span`).textContent = `Next`;
  const boxImg = document.createElement(`img`);
  boxImg.className = `content-img box-image`;
  boxImg.src = ``;
  boxImg.alt = ``;
  boxDecorToolbar.prepend(btnLaunch, btnClose);
  boxGallery.prepend(boxDecorInfobar, boxDecorToolbar, btnBack, btnNext, boxImg);
  return boxGallery
}

// Создать меню для галереи под категории имеющихся фото
function creatMenuGallery(menu, menuItems) {
  const menuListItem = menu.querySelector(`.menu__list__item`);
  menuItems.forEach(category => {
    const cloneMenuItem = menuListItem.cloneNode(true);
    menu.append(cloneMenuItem);
    const lastMenuItem = menu.lastElementChild;
    lastMenuItem.querySelector(`.menu-link-active`).classList.remove(`menu-link-active`);
    lastMenuItem.dataset.category = category;
    lastMenuItem.querySelector(`.menu__link`).textContent = category;
  });
  return [...menu.querySelectorAll(`.menu__list__item`)];
}

// Выбор нужных фото по категории
function choseCategory(menu, index, activeCategory = 0) {
  menu[activeCategory].querySelector(`.menu__link`).classList.remove(`menu-link-active`);
  menu[index].querySelector(`.menu__link`).classList.add(`menu-link-active`);
  const categoryMenu = menu[index].dataset.category;
  sortByCategory(categoryMenu);
}

// Сортировать изображения по категориям
function sortByCategory(categoryMenu) {
  allImages.forEach(img => {
    const categoryImg = img.dataset.category;
    (categoryImg !== categoryMenu && categoryMenu !== `Все`) ? img.dataset.visible = `off` : 
    (img.dataset.visible !== `on`) ? img.dataset.visible = `on` : false;
  });
}

// Открыть изображение на полный экран
function openImgToFull(index) {
  document.body.style.overflow = `hidden`;
  const boxImage = boxGallery.querySelector(`.box-image`);
  const decorInfobar = boxGallery.querySelector(`.decor-infobar`);
  boxGallery.dataset.visible = `on`;
  boxImage.src = allImages[index].querySelector(`.gallery__img`).src;
  boxImage.alt = allImages[index].querySelector(`.gallery__img`).alt;
  const posOpenImg = visibleImages.findIndex(img => img.querySelector(`.content-img`).src === boxImage.src);
  decorInfobar.textContent = `${posOpenImg + 1}/${visibleImages.length}...(${allImages.length})`;
}

// Включить автослайд
function btnLaunchSlider(boxGallery) {
  const btnLaunch = boxGallery.querySelector(`.btn-img__launch`);
  btnLaunch.addEventListener(`click`, () => {
    // Проверка на запуск автослайда
    launchSlider(boxGallery);
  });
  document.addEventListener(`keydown`, btn => {
    // Проверка на запуск автослайда
    (boxGallery.dataset.visible === `on` && btn.key === ` `) ? ( btn.preventDefault(), launchSlider(boxGallery) ) : false;
  });
}

// Проверка на запуск автослайда
function launchSlider(boxGallery) {
  const boxImage = boxGallery.querySelector(`.box-image`);
  const decorInfobar = boxGallery.querySelector(`.decor-infobar`);
  const btnLaunch = boxGallery.querySelector(`.btn-img__launch`);
  if (!launchIntervalId) {
    btnLaunch.textContent = `\u{275a}\u{275a}`;
    launchIntervalId = setInterval(() => {
      let currentPosImg = +decorInfobar.textContent.replace(/\/.+/g, ``);
      if (currentPosImg === visibleImages.length) {
        currentPosImg = 1;
        changeSlide(currentPosImg, decorInfobar, boxImage);
      } else {
        currentPosImg = currentPosImg + 1;
        changeSlide(currentPosImg, decorInfobar, boxImage);
      };
    }, `${timerSlider}`);
  } else {
    btnLaunch.textContent = `\u{25ba}`;
    clearInterval(launchIntervalId);
    launchIntervalId = undefined;
  };
}

// Чередовать изображения
function switchImages(boxGallery) {
  const boxImage = boxGallery.querySelector(`.box-image`);
  const decorInfobar = boxGallery.querySelector(`.decor-infobar`);
  const btnBack = boxGallery.querySelector(`.navigation-btn__back`);
  const btnNext = boxGallery.querySelector(`.navigation-btn__next`);
  btnBack.addEventListener(`click`, () => {
    let currentPosImg = +decorInfobar.textContent.replace(/\/.+/g, ``);
    if (currentPosImg === 1) {
      currentPosImg = visibleImages.length;
      changeSlide(currentPosImg, decorInfobar, boxImage);
    } else {
      currentPosImg = currentPosImg - 1;
      changeSlide(currentPosImg, decorInfobar, boxImage);
    }
  });
  btnNext.addEventListener(`click`, () => {
    let currentPosImg = +decorInfobar.textContent.replace(/\/.+/g, ``);
    if (currentPosImg === visibleImages.length) {
      currentPosImg = 1;
      changeSlide(currentPosImg, decorInfobar, boxImage);
    } else {
      currentPosImg = currentPosImg + 1;
      changeSlide(currentPosImg, decorInfobar, boxImage);
    }
  });
  document.addEventListener(`keydown`, btn => {
    if (boxGallery.dataset.visible === `on` && (btn.key === `ArrowLeft` || btn.key === `ArrowRight`)) {
      let currentPosImg = +decorInfobar.textContent.replace(/\/.+/g, ``);
      if (btn.key === `ArrowLeft` && currentPosImg === 1) {
        currentPosImg = visibleImages.length;
        changeSlide(currentPosImg, decorInfobar, boxImage);
      } else if (btn.key === `ArrowLeft`) {
        currentPosImg = currentPosImg - 1;
        changeSlide(currentPosImg, decorInfobar, boxImage);
      } else if (btn.key === `ArrowRight` && currentPosImg === visibleImages.length) {
        currentPosImg = 1;
        changeSlide(currentPosImg, decorInfobar, boxImage);
      } else {
        currentPosImg = currentPosImg + 1;
        changeSlide(currentPosImg, decorInfobar, boxImage);
      };
    };
  });
}

// Смена слайдов для галереи
function changeSlide(currentPosImg, decorInfobar, boxImage) {
  decorInfobar.textContent = `${currentPosImg}/${visibleImages.length}...(${allImages.length})`;
  boxImage.src = visibleImages[currentPosImg - 1].querySelector(`.gallery__img`).src;
  boxImage.alt = visibleImages[currentPosImg - 1].querySelector(`.gallery__img`).alt;
}

// Закрыть полноэкранный просмотр изображенния
function closeImgFull(boxGallery) {
  const closeImgFull = boxGallery.querySelector(`.btn-img__close`);
  closeImgFull.addEventListener(`click`, () => {
    // Проверка на автослайд и закрытие окна просмотра изображений
    checkLaunch(boxGallery);
  });
  document.addEventListener(`keydown`, btn => {
    // Проверка на автослайд и закрытие окна просмотра изображений
    (boxGallery.dataset.visible === `on` && btn.key === `Escape`) ? checkLaunch(boxGallery) : false;
  });
}

// Проверка на автослайд и закрытие окна просмотра изображений
function checkLaunch(boxGallery) {
  document.body.style.overflow = ``;
  if (launchIntervalId) {
    // Проверка на запуск автослайда
    launchSlider(boxGallery);
    boxGallery.dataset.visible = `off`;
    return
  };
  boxGallery.dataset.visible = `off`;
}

// Выбор нужных фото по категории
function choseImgsForCategory(section, menu, activeCategory) {
  menu.forEach((item, index) => {
    let menuLink = item.querySelector(`.menu__link`);
    menuLink.addEventListener(`click`, event => {
      event.preventDefault();
      choseCategory(menu, index, activeCategory);
      visibleImages = creatArrOpenImg(section);
      return activeCategory = index;
    });
  });
}

// Подгрузить все изображения с сайта
function uploadImages(btnShowGallery, wrapGallery, gallery, menuGallery) {
  btnShowGallery.addEventListener(`click`, async () => {
    const formData = new FormData();
    formData.append(`event`, `gallery`);
    const res = await fetch(`/app.php`, { 
      method: `POST`,
      body: formData,
    })
    let resImages;
    res.ok ? resImages = await res.text() : alert(`Ошибка HTTP: ` + res.status);
    wrapGallery.innerHTML += resImages;
    allImages = [...wrapGallery.querySelectorAll(`.inner-gallery`)];
    // Перебор всех изображений, раздатчик кнопок "открыть на полный экран"
    customizeImages(gallery, menuGallery);
    const categoryMenu = menuGallery.querySelector(`.menu-link-active`).closest(`.menu__list__item`).dataset.category;
    // Сортировать изображения по категориям
    sortByCategory(categoryMenu);
    btnShowGallery.style.display = `none`;
  }, {once: true});
}

// ---------- Секция видео ----------

// Запустить видео
function launchVideo() {
  const video = document.querySelector(`.video`);
  const videoSource = video.querySelector(`source`);
  const mediaImg = document.querySelector(`.media__img`);
  const decorPlay = document.querySelector(`.decor-play`);
  mediaImg.addEventListener(`click`, async () => {
    const res = await fetch(videoSource.src);
    if (res.ok) {
      video.classList.add(`video-active`);
    } else {
      console.log(`Ошибка HTTP: ` + res.status);
      videoSource.src = `assets/video/video.mp4`;
      video.classList.add(`video-active`);
    }
    video.play();
    mediaImg.classList.add(`media__img-hidden`);
    decorPlay.classList.add(`decor-play-hidden`);
  });
}

// ---------- Секция блога ----------

// Чередовать слайды в Блоге
function switchSlides() {
  const blog = document.querySelector(`.blog`);
  const wrapSliderTrack = blog.querySelector(`.wrap_slider-track`);
  const blogSlides = [...blog.querySelectorAll(`.wrap__blog-slide`)];
  const btnBack = blog.querySelector(`.navigation-btn__back`);
  const btnNext = blog.querySelector(`.navigation-btn__next`);
  const slideDots = [...blog.querySelectorAll(`.slide-dot`)];
  let currentPosSlide = 0;
  btnBack.addEventListener(`click`, () => {
    if (currentPosSlide === 0) {
      currentPosSlide = (blogSlides.length - 1);
      // Смена слайдов для блога
      changeSlideBlog(currentPosSlide, blogSlides);
      // Смена нижней навигации (дотов) слайдов для блога
      changeDotsBlog(slideDots, wrapSliderTrack, currentPosSlide);
    } else {
      currentPosSlide -= 1;
      // Смена слайдов для блога
      changeSlideBlog(currentPosSlide, blogSlides);
      // Смена нижней навигации (дотов) слайдов для блога
      changeDotsBlog(slideDots, wrapSliderTrack, currentPosSlide);
    }
  });
  btnNext.addEventListener(`click`, () => {
    if (currentPosSlide === (blogSlides.length - 1)) {
      currentPosSlide = 0;
      // Смена слайдов для блога
      changeSlideBlog(currentPosSlide, blogSlides);
      // Смена нижней навигации (дотов) слайдов для блога
      changeDotsBlog(slideDots, wrapSliderTrack, currentPosSlide);
    } else {
      currentPosSlide += 1;
      // Смена слайдов для блога
      changeSlideBlog(currentPosSlide, blogSlides);
      // Смена нижней навигации (дотов) слайдов для блога
      changeDotsBlog(slideDots, wrapSliderTrack, currentPosSlide);
    }
  });
  // Скролинг блока для адаптивной верстки
  const windowWidth = window.innerWidth;
  wrapSliderTrack.addEventListener('scroll', () => {
    if ((wrapSliderTrack.scrollLeft) > (windowWidth / 2 + windowWidth * currentPosSlide)) {
      currentPosSlide += 1;
      // Смена слайдов для блога
      changeSlideBlog(currentPosSlide, blogSlides);
      // Смена нижней навигации (дотов) слайдов для блога
      changeDotsBlog(slideDots, false, currentPosSlide);
    } else if ((wrapSliderTrack.scrollLeft) < (windowWidth / 2 + windowWidth * currentPosSlide - windowWidth)) {
      currentPosSlide -= 1;
      // Смена слайдов для блога
      changeSlideBlog(currentPosSlide, blogSlides);
      // Смена нижней навигации (дотов) слайдов для блога
      changeDotsBlog(slideDots, false, currentPosSlide);
    }
  });
  // Раздатчие кликов по навигации (дотам)
  slideDots.forEach((dot, index) => {
    dot.addEventListener(`click`, () => {
      currentPosSlide = index;
      // Смена слайдов для блога
      changeSlideBlog(currentPosSlide, blogSlides);
      // Смена нижней навигации (дотов) слайдов для блога
      changeDotsBlog(slideDots, wrapSliderTrack, currentPosSlide);
    });
  });
}

// Смена слайдов для блога
function changeSlideBlog(currentPosSlide, blogSlides) {
  for (const slide of blogSlides) {
    if (slide.dataset.visible === `on`) {
      slide.dataset.visible = `off`;
      blogSlides[currentPosSlide].dataset.visible = `on`;
      break
    }
  }
}

// Смена нижней навигации (дотов) слайдов для блога
function changeDotsBlog(slideDots, wrapSliderTrack, currentPosSlide) {
  for (const dot of slideDots) {
    if (dot.dataset.color === `on`) {
      dot.dataset.color = `off`;
      slideDots[currentPosSlide].dataset.color = `on`;
      if (wrapSliderTrack) {
        wrapSliderTrack.scrollLeft = currentPosSlide * window.innerWidth;
      } 
    break  
    }
  }
}

// ---------- Секция формы обр. связи ----------

// Настройка формы обратной связи
function settingForm() {
  const form = document.querySelector(`.form`);
  form.addEventListener(`submit`, async event => {
    event.preventDefault();
    const formData = new FormData(form);
    formData.append(`form`, true);
    const res = await fetch(form.action, { 
      method: form.method,
      body: formData,
    });
    res.ok ? alert(await res.text()) : alert(`Ошибка HTTP: ` + res.status);
  });
}