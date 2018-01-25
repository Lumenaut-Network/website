// i18n
var translate = null;

// Method to translate into the specified language
function translateInto(lang) {
	// Getting all the nodes having a 'data-i18n' attribute
	var nodes = document.querySelectorAll('[data-i18n]');

	// Fetching the matched JSON translation file
	$.get({
		url: './assets/i18n/' + lang + '.json'
	}).then((data) => {
		const languageFile = JSON.parse(data)
		translate = i18n.create({
			values: languageFile
		});
		
		// Looping through the nodes to replace the [data-i18n]
		// attribute string into the translation
		for (const node of nodes) {
			const key = node.attributes['data-i18n'].value;
			const translation = translate(key); // to replace
			if (translation) {
				node.innerHTML = translation;
			}
		}
	});
}

$(document).ready(() => {
	translateInto("en_US");
});