// Импорт функционала ==============================================================================================================================================================================================================================================================================================================================
// import { isMobile } from "./functions.js";
// import { formsModules } from "./forms/forms.js";

/* Календарь */
// https://github.com/qodesmith/datepicker#installation
import datepicker from "js-datepicker";

window.addEventListener("load", function (e) {
	const bg = document.querySelectorAll('[data-bg]');
	if (bg.length) {
		bg.forEach(bgItem => {
			bgItem.insertAdjacentHTML('beforeend', `<div class="bg-item"></div>`);
		});
	}

	const picker = datepicker('[data-calendar]', {
		//customDays: ['天', '一', '二', '三', '四', '五', '六']
	});

	if (document.querySelector('.video-module')) {
		document.addEventListener("watcherCallback", function (e) {
			const entry = e.detail.entry;
			const targetElement = entry.target;
			if (targetElement.dataset.watch === 'video' && !targetElement.classList.contains('_init')) {
				if (entry.isIntersecting) {
					// Видим объект
					targetElement.querySelector('video').play();
				} else {
					// Не видим объект
					targetElement.querySelector('video').pause();
				}
			}
		});
		const videoModule = document.querySelector('.video-module');
		videoModule.addEventListener("click", function (e) {
			if (!videoModule.classList.contains('_init')) {
				videoModule.querySelector('video').src = videoModule.querySelector('video').dataset.full;
				videoModule.classList.add('_active');
				videoModule.classList.add('_init');
				videoModule.querySelector('video').play();
				videoModule.querySelector('video').muted = false;
			} else {
				if (videoModule.querySelector('video').paused) {
					videoModule.querySelector('video').play();
				} else {
					videoModule.querySelector('video').pause();
				}
				videoModule.classList.toggle('_active');
			}
		});
	}
});