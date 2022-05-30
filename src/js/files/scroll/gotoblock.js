// Импорт функционала ====================================================================================================================================================================================================================================================================================================
// Вспомогательные функции
import { isMobile, menuClose, getHash } from "../functions.js";
// Подключение дополнения для увеличения возможностей
// Документация: https://github.com/cferdinandi/smooth-scroll
// import SmoothScroll from 'smooth-scroll';
//==============================================================================================================================================================================================================================================================================================================================

// Модуль плавной проктутки к блоку
export let gotoBlock = (targetBlock, noHeader = false, speed = 500, offset = 0) => {
	const targetBlockElement = document.querySelector(targetBlock);
	if (targetBlockElement) {
		let headerItem = '';
		let headerItemHeight = 0;
		//OffsetHeader
		if (noHeader) {
			headerItem = 'header.header';
			headerItemHeight = document.querySelector(headerItem).offsetHeight;
		}
		let options = {
			speedAsDuration: true,
			speed: speed,
			header: headerItem,
			offset: offset,
			easing: 'easeOutQuad',
		};
		// Закрываем меню, если оно открыто
		document.documentElement.classList.contains("menu-open") ? menuClose() : null;

		if (typeof SmoothScroll !== 'undefined') {
			// Прокрутка с использованием дополнения
			new SmoothScroll().animateScroll(targetBlockElement, '', options);
		} else {
			// Прокрутка стандартными средствами
			let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
			// дописать!
			window.scrollTo({
				top: headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition,
				behavior: "smooth"
			});
		}
	} else {
		console.log(`[gotoBlock]: Такого блока нет на странице: ${targetBlock}`);
	}
};