$(document).ready(function() {
	$('#verify-xlm-address-button').click((e) => {
		console.log(e);
		e.preventDefault();

		const result = $('#verify-xlm-address-result');
		result.text('you did it correctly! - or - it takes a few minutes sometimes, try again later');
		result.show();

	});
});

$(window).scroll(function() {    
	var scroll = $(window).scrollTop();

	if (scroll >= 300) {
		$("body header").addClass("sticky");
	}
	else {
		$("body header").removeClass();
	}
});