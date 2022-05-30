import { gallery } from "./gallery.js";

/*
Документация по работе в шаблоне: 
Документация слайдера: https://swiperjs.com/
Сниппет(HTML): swiper
*/

// Подключаем слайдер Swiper из node_modules
// При необходимости подключаем дополнительные модули слайдера, указывая их в {} через запятую
// Пример: { Navigation, Autoplay }
import Swiper, { Navigation, Pagination, Lazy, EffectFade, Autoplay, FreeMode } from 'swiper';
/*
Основниые модули слайдера:
Navigation, Pagination, Autoplay, 
EffectFade, Lazy, Manipulation
Подробнее смотри https://swiperjs.com/
*/

// Стили Swiper
// Базовые стили
import "../../scss/base/swiper.scss";
// Полный набор стилей из scss/libs/swiper.scss
// import "../../scss/libs/swiper.scss";
// Полный набор стилей из node_modules
// import 'swiper/css';

// Добавление классов слайдерам
// swiper главному блоку, swiper-wrapper оболочке, swiper-slide для слайдов
function bildSliders() {
	//BildSlider
	let sliders = document.querySelectorAll('[class*="__swiper"]:not(.swiper-wrapper)');
	if (sliders) {
		sliders.forEach(slider => {
			slider.parentElement.classList.add('swiper');
			slider.classList.add('swiper-wrapper');
			for (const slide of slider.children) {
				slide.classList.add('swiper-slide');
			}
		});
	}
}
// Инициализация слайдеров
function initSliders() {
	// Добавление классов слайдера
	// при необходимости отключить
	bildSliders();

	// Перечень слайдеров
	if (document.querySelector('.body-main-slider')) {
		new Swiper('.body-main-slider', {
			// Подключаем модули слайдера
			// для конкретного случая
			modules: [Pagination, EffectFade, Lazy, Autoplay],
			effect: 'fade',
			autoplay: {
				delay: 3000,
				disableOnInteraction: false,
			},
			observer: true,
			observeParents: true,
			slidesPerView: 1,
			spaceBetween: 0,
			autoHeight: false,
			speed: 1000,
			//touchRatio: 0,
			//simulateTouch: false,
			loop: true,
			preloadImages: false,
			lazy: {
				loadPrevNext: true,
			},
			// Dotts
			pagination: {
				el: '.body-main-slider__controll',
				clickable: true,
			},
			// Arrows
			/*
			navigation: {
				nextEl: '.about__more .more__item_next',
				prevEl: '.about__more .more__item_prev',
			},
			*/
			breakpoints: {
				320: {
					autoHeight: true,
				},
				992: {
					autoHeight: false,
				}
			},
			on: {
				init: function () {
					const controll = document.querySelectorAll('.body-main-slider__controll .swiper-pagination-bullet');
					controll.forEach((el, index) => {
						let num;
						if (index < 10) {
							num = `0`;
						}
						el.innerHTML = `${num}${index + 1}`;
					});
				},
				breakpoint: function (swiper, info) {
					!info.autoHeight ? document.querySelector('.body-main-slider__swiper').style.height = 'auto' : '';
					swiper.updateSize();
				},
			}
		});
	}
	if (document.querySelector('.gallery__slider')) {
		let gallerySlider = new Swiper('.gallery__slider', {
			// Подключаем модули слайдера
			// для конкретного случая
			modules: [Lazy, Autoplay, FreeMode],
			autoplay: {
				delay: 3000,
				stopOnLastSlide: false,
				disableOnInteraction: false,
			},
			freeMode: {
				enabled: true,
			},
			observer: true,
			observeParents: true,
			slidesPerView: "auto",
			spaceBetween: 32,
			autoHeight: false,
			speed: 1000,
			//touchRatio: 0,
			//simulateTouch: false,
			loop: true,
			preloadImages: false,
			lazy: {
				loadPrevNext: true,
			},
			// Arrows
			/*
			navigation: {
				nextEl: '.about__more .more__item_next',
				prevEl: '.about__more .more__item_prev',
			},
			*/
			breakpoints: {
			},
			on: {
				slideChange: function (swiper) {

				}
			}
		});
		function gallerySliderFix() {
			const galleryContainer = document.querySelector('.gallery__container');
			const diff = (window.innerWidth - galleryContainer.offsetWidth) / 2;
			if (diff > 0) {
				document.querySelector('.gallery__slider').style.width = document.querySelector('.gallery__body').offsetWidth + diff + 15 + 'px';
			} else {
				document.querySelector('.gallery__slider').style.width = document.querySelector('.gallery__body').offsetWidth + 15 + 'px';
			}
		}
		window.addEventListener("resize", gallerySliderFix);
		gallerySliderFix();
		gallerySlider.update();
	}
}
// Скролл на базе слайдера (по классу swiper_scroll для оболочки слайдера)
function initSlidersScroll() {
	// Добавление классов слайдера
	// при необходимости отключить
	bildSliders();

	let sliderScrollItems = document.querySelectorAll('.swiper_scroll');
	if (sliderScrollItems.length > 0) {
		for (let index = 0; index < sliderScrollItems.length; index++) {
			const sliderScrollItem = sliderScrollItems[index];
			const sliderScrollBar = sliderScrollItem.querySelector('.swiper-scrollbar');
			const sliderScroll = new Swiper(sliderScrollItem, {
				observer: true,
				observeParents: true,
				direction: 'vertical',
				slidesPerView: 'auto',
				freeMode: {
					enabled: true,
				},
				scrollbar: {
					el: sliderScrollBar,
					draggable: true,
					snapOnRelease: false
				},
				mousewheel: {
					releaseOnEdges: true,
				},
			});
			sliderScroll.scrollbar.updateSize();
		}
	}
}

window.addEventListener("load", function (e) {
	// Запуск инициализации слайдеров
	initSliders();
	// Запуск инициализации скролла на базе слайдера (по классу swiper_scroll)
	//initSlidersScroll();
});