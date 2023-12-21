<?php

if (!empty($_POST)) {
  if (in_array('gallery', $_POST)) {
    if (!empty($modx) && is_array($scriptProperties)) {
      extract($scriptProperties, EXTR_SKIP);
      return $modx->runSnippet('GalleryReturnJSON', $scriptProperties);
    }
    echo 
    '<div class="section-inner inner-gallery" data-category="Профи" data-visible="on">
      <img class="content-img gallery__img" src="assets/images/gallery/gallery-1.jpg" alt="Серфер катается">
    </div>
    <div class="section-inner inner-gallery" data-category="Туристы" data-visible="on">
      <img class="content-img gallery__img" src="assets/images/gallery/gallery-2.jpg" alt="Ребенок на песке с серфингом">
    </div>
    <div class="section-inner inner-gallery" data-category="Профи" data-visible="on">
      <img class="content-img gallery__img" src="assets/images/gallery/gallery-3.jpg" alt="Мужчина с серфингом в руках">
    </div>
    <div class="section-inner inner-gallery" data-category="Туристы" data-visible="on">
      <img class="content-img gallery__img" src="assets/images/gallery/gallery-4.jpg" alt="Две женщины стоят с серфингами">
    </div>
    <div class="section-inner inner-gallery" data-category="Природа" data-visible="on">
      <img class="content-img gallery__img" src="assets/images/gallery/gallery-5.jpg" alt="Внутри волны">
    </div>
    <div class="section-inner inner-gallery" data-category="Природа" data-visible="on">
      <img class="content-img gallery__img" src="assets/images/gallery/gallery-6.jpg" alt="Девушка стоит с серфингом в руках перед морем">
    </div>';
  } elseif (isset($_POST['form'])) {
    print_r($_POST);
  }
}

?>