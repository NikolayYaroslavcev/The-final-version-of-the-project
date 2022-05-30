// Класс масок для полей ввода (в работе)
export class InputMask {
	constructor(props, data = null) {
		let defaultConfig = {
			init: true,
			logging: false,
		}
		this.config = Object.assign(defaultConfig, props);
		// Запуск инициализации
		if (this.config.init) {
			// Получение всех масок на странице
			const maskItems = data ? document.querySelectorAll(data) : document.querySelectorAll('[data-mask]');
			if (maskItems.length) {
				this.initMasks(maskItems);
				this.setLogging(`Проснулся, построил масок: (${maskItems.length})`);
			} else {
				this.setLogging('Нет ни одной маски. Сплю...zzZZZzZZz...');
			}
		}
	}
	initMasks(maskItems) {
		maskItems.forEach(maskItem => {
			initMask(maskItem);
		});
	}
	initMask(maskItem) {
	}
	getMask() {
	}
	// Логгинг в консоль
	setLogging(message) {
		this.config.logging ? console.log(`[Elton Mask]: ${message}`) : null;
	}
}