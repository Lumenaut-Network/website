function setButton(text, disabled) {
	document.getElementById("btn-vote").innerHTML = text;
	document.getElementById("btn-vote").disabled = disabled;
}

function setLink(text, href) {
	if (text) document.getElementById("tra-link").innerHTML = text;
	if (href) document.getElementById("tra-link").href = href;
	document.getElementById("tra-link").style = "display: inline";
}

function vote() {
	setButton("Loading...", true);

	var secKey = document.getElementById("secret").value;
	var address = "POOL ADDRESS"

	var sourceKeypair;
	try {
		sourceKeypair = StellarSdk.Keypair.fromSecret(secKey);
	} catch(err) {
		alert("Invalid key");
		setButton("Join Pool", false);
		document.getElementById("secret").value = "";
		return;
	}
	var sourcePublicKey = sourceKeypair.publicKey();

	var server = new StellarSdk.Server('https://horizon.stellar.org');
	StellarSdk.Network.usePublicNetwork();

	server.loadAccount(sourcePublicKey)
	.then(function(account) {
		setButton("Building...", true);
		var transaction = new StellarSdk.TransactionBuilder(account)
		.addOperation(StellarSdk.Operation.setOptions({
			inflationDest: address,
		}))
		.build();

		transaction.sign(sourceKeypair);

		console.log(transaction.toEnvelope().toXDR('base64'));

		setButton("Submitting...", true);
		server.submitTransaction(transaction)
		.then(function(transactionResult) {
			setButton("Join Pool", false);
			setLink(null, transactionResult._links.transaction.href);
		})
		.catch(function(err) {
			setLink("An error occured, check the console", null);
			console.log('An error has occured:');
			console.log(err);
		});
	})
	.catch(function(e) {
		setButton("Join Pool", false);
		setLink("An error occured, check the console", null);
		console.log('An error has occured:');
		console.error(e);
	});
}

// clipboard
$(document).ready(() => {
	var clipboard = new Clipboard('#copy-address-link');
	const $addrLink = $('#copy-address-link');
	$addrLink.click((e) => {
		e.preventDefault();
		console.log('copied');
		$addrLink.addClass('visited');

		// change copy icon to check icon
		$(this)
			.find('[data-fa-processed]')
			.toggle('fa-copy')
			.toggle('fa-check-circle');
	});
})
