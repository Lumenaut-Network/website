$(document).ready(function() {
	// change this to Lumenaut pool address
	const POOL_ADDRESS = 'GA3FUYFOPWZ25YXTCA73RK2UGONHCO27OHQRSGV3VCE67UEPEFEDCOPA';
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

$(window).scroll(function() {    
	var scroll = $(window).scrollTop();

	if (scroll >= 300) {
		$("body header").addClass("sticky");
	}
	else {
		$("body header").removeClass();
	}
});
