// Импорт функционала ====================================================================================================================================================================================================================================================================================================
// Вспомогательные функции.
import { isMobile } from "../functions.js";
// Импорт класса наблюдателя.
import { ScrollWatcher } from "../../libs/watcher.js";
// Модуль прокрутки к блоку (раскомментировать при использовании).
import { gotoBlock } from "./gotoblock.js";
// Переменная контроля добавления события window scroll.
let addWindowScrollEvent = false;
//====================================================================================================================================================================================================================================================================================================
// Запуск наблюдателя
// Создание дополнительной обработки элемента
// Требует импорта ScrollWatcher
export function scrollWatcher(logging = false) {
	new ScrollWatcher({
		logging: logging
	});
}
// Плавная навигация по странице
export function pageNavigation() {
	// data-goto - указать ID блока
	// data-goto-header - учитывать header
	// data-goto-speed - скорость (только если используется доп плагин)
	// Работаем при клике на пункт
	document.addEventListener("click", pageNavigationAction);
	// Если подключен scrollWatcher, подсвечиваем текущий пукт меню
	document.addEventListener("watcherCallback", pageNavigationAction);
	// Основная функция
	function pageNavigationAction(e) {
		if (e.type === "click") {
			const targetElement = e.target;
			if (targetElement.closest('[data-goto]')) {
				const gotoLink = targetElement.closest('[data-goto]');
				const noHeader = gotoLink.hasAttribute('data-goto-header') ? true : false;
				const gotoSpeed = gotoLink.dataset.gotoSpeed ? gotoLink.dataset.gotoSpeed : '500';
				gotoBlock(`#${gotoLink.dataset.goto}`, noHeader, gotoSpeed);
				e.preventDefault();
			}
		} else if (e.type === "watcherCallback") {
			if (e.detail) {
				const entry = e.detail.entry;
				const targetElement = entry.target;
				// Обработка пунктов навигации, если указано значение navigator подсвечиваем текущий пукт меню
				if (targetElement.dataset.watch === 'navigator') {
					const navigatorItem = targetElement.id;
					const navigatorActiveItem = document.querySelector(`[data-goto]._navigator-active`);
					const navigatorCurrentItem = document.querySelector(`[data-goto="${navigatorItem}"]`);
					if (entry.isIntersecting) {
						// Видим объект
						// navigatorActiveItem ? navigatorActiveItem.classList.remove('_navigator-active') : null;
						navigatorCurrentItem ? navigatorCurrentItem.classList.add('_navigator-active') : null;
					} else {
						// Не видим объект
						navigatorCurrentItem ? navigatorCurrentItem.classList.remove('_navigator-active') : null;
					}
				}
			}
		}
	}
}
// Работа с шапкой при скроле
export function headerScroll() {
	addWindowScrollEvent = true;
	const header = document.querySelector('header.header');
	const headerShow = header.hasAttribute('data-scroll-show'); // Добавить
	const headerShowTimer = header.dataset.scrollShow ? header.dataset.scrollShow : 500;
	const startPoint = header.dataset.scroll ? header.dataset.scroll : 1;
	let scrollDirection = 0;
	let timer;
	document.addEventListener("windowScroll", function (e) {
		const scrollTop = window.scrollY;
		clearTimeout(timer);
		if (scrollTop >= startPoint) {
			!header.classList.contains('_header-scroll') ? header.classList.add('_header-scroll') : null;
			if (headerShow) {
				if (scrollTop > scrollDirection) {
					// downscroll code
					header.classList.contains('_header-show') ? header.classList.remove('_header-show') : null;
				} else {
					// upscroll code
					!header.classList.contains('_header-show') ? header.classList.add('_header-show') : null;
				}
				timer = setTimeout(() => {
					!header.classList.contains('_header-show') ? header.classList.add('_header-show') : null;
				}, headerShowTimer);
			}
		} else {
			header.classList.contains('_header-scroll') ? header.classList.remove('_header-scroll') : null;
			if (headerShow) {
				header.classList.contains('_header-show') ? header.classList.remove('_header-show') : null;
			}
		}
		scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
	});
}
// Прилипающий блок
export function stickyBlock() {
	addWindowScrollEvent = true;
	// data-sticky для родителя внутри которого прилипает блок *
	// data-sticky-header для родителя, учитываем высоту хедера
	// data-sticky-top="" для родителя, можно указать отступ сверху
	// data-sticky-bottom="" для родителя, можно указать отступ снизу
	// data-sticky-item для прилипающего блока *
	function stickyBlockInit() {
		const stickyParents = document.querySelectorAll('[data-sticky]');
		if (stickyParents.length) {
			stickyParents.forEach(stickyParent => {
				let stickyConfig = {
					top: stickyParent.dataset.stickyTop ? stickyParent.dataset.stickyTop : 0,
					bottom: stickyParent.dataset.stickyBottom ? stickyParent.dataset.stickyBottom : 0,
					header: stickyParent.hasAttribute('data-sticky-header')
				}
				stickyBlockItem(stickyParent, stickyConfig);
			});
		}
	}
	function stickyBlockItem(stickyParent, stickyConfig) {
		const stickyBlockItem = stickyParent.querySelector('[data-sticky-item]');
		const headerHeight = stickyConfig.header ? document.querySelector('header.header').offsetHeight : 0;
		const offsetTop = headerHeight + stickyConfig.top;
		document.addEventListener("windowScroll", function (e) {
			const startPoint = stickyBlockItem.getBoundingClientRect().top + scrollY - offsetTop;
			const endPoint = (stickyParent.offsetHeight + stickyParent.getBoundingClientRect().top + scrollY) - (offsetTop + stickyBlockItem.offsetHeight + stickyConfig.bottom);
			let stickyItemValues = {
				position: "relative",
				bottom: "auto",
				top: "0px",
				left: "0px",
				width: "auto"
			}
			if (offsetTop + stickyConfig.bottom + stickyBlockItem.offsetHeight < window.innerHeight) {
				if (scrollY >= startPoint && scrollY <= endPoint) {
					stickyItemValues.position = `fixed`;
					stickyItemValues.bottom = `auto`;
					stickyItemValues.top = `${offsetTop}px`;
					stickyItemValues.left = `${stickyBlockItem.getBoundingClientRect().left}px`;
					stickyItemValues.width = `${stickyBlockItem.offsetWidth}px`;
				} else if (scrollY >= endPoint) {
					stickyItemValues.position = `absolute`;
					stickyItemValues.bottom = `${stickyConfig.bottom}px`;
					stickyItemValues.top = `auto`;
					stickyItemValues.left = `0px`;
					stickyItemValues.width = `${stickyBlockItem.offsetWidth}px`;
				}
			}
			stickyBlockType(stickyBlockItem, stickyItemValues);
		});
	}
	function stickyBlockType(stickyBlockItem, stickyItemValues) {
		stickyBlockItem.style.cssText = `position:${stickyItemValues.position};bottom:${stickyItemValues.bottom};top:${stickyItemValues.top};left:${stickyItemValues.left};width:${stickyItemValues.width};`;
	}
	stickyBlockInit();
}

export function bgParallax() {
	addWindowScrollEvent = true;
	const bgItems = document.querySelectorAll('[data-bg]');
	if (bgItems.length) {
		document.addEventListener("windowScroll", function (e) {
			bgItems.forEach(bgItem => {
				//let size = bgItem.dataset.bg ? Number(bgItem.dataset.bg) : 30;
				let bgItemPosition = bgItem.getBoundingClientRect().top + scrollY;
				let bgItemHeight = bgItem.offsetHeight;
				let bgItemBg = bgItem.querySelector('.bg-item');
				let bgItemScrollPrc = Math.abs((bgItem.getBoundingClientRect().top - window.innerHeight) / (bgItemHeight + window.innerHeight) * 100);
				let bgItemPositionValue = (bgItemHeight / 100 * 30) / 100 * bgItemScrollPrc;
				if (bgItemBg) {
					if (scrollY > bgItemPosition - window.innerHeight && scrollY < bgItemPosition + bgItemHeight) {
						bgItemBg.style.cssText = `transform: translate3D(0,${bgItemPositionValue}px,0);`;
					}
				}
			});
		});
	}
}

// При подключении модуля обработчик события запустится автоматически
setTimeout(() => {
	if (addWindowScrollEvent) {
		let windowScroll = new Event("windowScroll");
		window.addEventListener("scroll", function (e) {
			document.dispatchEvent(windowScroll);
		});
	}
}, 0);

