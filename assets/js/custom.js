// Setup & Instructions
$(document).ready(function() {
	// Lumenaut Community Pool address
	const POOL_ADDRESS = 'GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT';
	const $walletLogos = $('.wallet-logos');
	const $castVoteTab = $('#v-pills-cast-vote-tab');
	const $instructions = $('.instructions');
	const $addrInput = $('#verify-xlm-address-input');
	const $verifyButton = $('#verify-xlm-address-button');
	const $verifyResult = $('#verify-xlm-address-result');

	const instructionsState = {};
	const wallet_to_custom_instructions = {
		'stellar-desktop-client': 'stellar-desktop-client-instructions',
		'ledger': 'ledger-nano-instructions'
	};

	const server = new StellarSdk.Server('https://horizon.stellar.org');
	StellarSdk.Network.usePublicNetwork();

	// listen for wallet logo clicks
	$walletLogos.click((e) => {
		e.preventDefault();

		const selected_wallet = e.target.dataset['wallet'];
		instructionsState['selected_wallet'] = selected_wallet;
		instructionsState['instructions'] = wallet_to_custom_instructions[selected_wallet] || 'stellar-laboratory-instructions';
		console.log(selected_wallet, instructionsState.instructions);

		$instructions.hide();
		$('#' + instructionsState.instructions).show();

		$castVoteTab.click();
	});


	$addrInput.keyup((e) => {
		e.preventDefault();

		$verifyResult.empty();

		const pubKey = $addrInput.val();
		if (pubKey && StellarSdk.StrKey.isValidEd25519PublicKey(pubKey)) {
			verifyAccount();
		}
	});

	$verifyButton.click(verifyAccount);

	function verifyAccount() {

		const pubKey = $addrInput.val();
		console.log('pub key: ', pubKey);

		if (!StellarSdk.StrKey.isValidEd25519PublicKey(pubKey)) {
			$verifyResult.empty();
			$verifyResult.append(
				"<div class=\"alert alert-warning alert-dismissible fade show\" role=\"alert\">\
					Invalid address. Try copy-pasting again.\
					<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\
						<span aria-hidden=\"true\">&times;</span>\
					</button>\
				</div>"
			);
			return;
		}

		try {
			server.loadAccount(pubKey).then((account) => {
				console.log(account);

				if (account.inflation_destination != POOL_ADDRESS) {
					$verifyResult.empty();
					$verifyResult.append(
						"<div class=\"alert alert-warning alert-dismissible fade show\" role=\"alert\">\
							Hmmm. Looks like you're not in the pool yet.\
							<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\
								<span aria-hidden=\"true\">&times;</span>\
							</button>\
						</div>"
					);
				} else {
					$verifyResult.empty();
					$verifyResult.append(
						"<div class=\"alert alert-success alert-dismissible fade show\" role=\"alert\">\
							Success! Welcome to the pool!\
							<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\
								<span aria-hidden=\"true\">&times;</span>\
							</button>\
						</div>"
					);
				}
			});
		} catch(err) {
			console.log(err);
			$verifyResult.empty();
			$verifyResult.append(
				"<div class=\"alert alert-warning alert-dismissible fade show\" role=\"alert\">\
					Error fetching account info. Please try again later.\
					<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\
						<span aria-hidden=\"true\">&times;</span>\
					</button>\
				</div>"
			);
			return;
		}
	}
});

// Navbar sticky class
$(window).scroll(function() {
	var scroll = $(window).scrollTop();
	var maxHeight = $('#welcome').outerHeight(true) - $('header').outerHeight(true);
	if (scroll >= maxHeight) {
		$("body header").addClass("sticky");
	}
	else {
		$("body header").removeClass();
		$('#welcome').children().each(function(index){
			$(this).css('opacity', 1 - scroll / ($('#welcome').height()/2 + index*90));
		});
	}
});

// if page refreshes already scrolled down
$(document).ready(() => {
	var maxHeight = $('#welcome').outerHeight(true) - $('header').outerHeight(true);
	if ($(window).scrollTop() >= maxHeight) {
		$('body header').addClass('sticky');
	}
});

// clipboard
$(document).ready(() => {
	var clipboard = new Clipboard('#copy-address-link');
	const $addrLink = $('#copy-address-link');
	$addrLink.click((e) => {
		e.preventDefault();
		$addrLink.addClass('visited');
	});

	var clipboard1 = new Clipboard('#copy-address-link-1');
	const $addrLink1 = $('#copy-address-link-1');
	$addrLink1.click((e) => {
		e.preventDefault();
		$addrLink1.addClass('visited');
	});

	var clipboard2 = new Clipboard('#copy-address-link-2');
	const $addrLink2 = $('#copy-address-link-2');
	$addrLink2.click((e) => {
		e.preventDefault();
		$addrLink2.addClass('visited');
	});

	var clipboard3 = new Clipboard('#copy-address-link-3');
	const $addrLink3 = $('#copy-address-link-3');
	$addrLink3.click((e) => {
		e.preventDefault();
		$addrLink3.addClass('visited');
	});
});

// fetch vote info from fed.network
$(document).ready(() => {
	// change to our pool once we have votes
	const inflationDest = 'GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT';
	$.get({
		url: 'https://fed.network/inflation/' + inflationDest
	}).then((result) => {
		$('#accounts-contributing').text(result.entries.length.toLocaleString());
		const totalVotes = result.entries.reduce((sum, entry) => {
			return sum + parseInt(entry.balance) / 10000000;
		}, 0);
		$('#total-votes').text(parseInt(totalVotes).toLocaleString());
	}, (err) => {
		console.log('error: ', err.responseJSON);
	});
});
