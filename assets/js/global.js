// fetch vote info
$(document).ready(() => {
	// pool address
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



// clipboard
$(document).ready(() => {
	var clipboard = new Clipboard('.addr a');
	const $inflation = $('.addrInflation a');
	const $donation = $('.addrDonation a');

	$inflation.click((e) => {
		e.preventDefault();
		$inflation.addClass('visited');
	});

	$donation.click((e) => {
		e.preventDefault();
		$donation.addClass('visited');
	});
});



// payments database
$(document).ready(function(){
	var table = $('#pool').DataTable({
		'paging':   false,
		'info':     false,
		'order': [[ 0, "desc" ]],
		'ajax': 'https://lumenaut-network.github.io/website/payments/arrays.txt',
		'columnDefs': [ {
			'targets': -1,
			'data': null,
			'defaultContent': '<a class="result"><svg style="fill:currentColor;" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M312 196v24c0 6.6-5.4 12-12 12h-68v68c0 6.6-5.4 12-12 12h-24c-6.6 0-12-5.4-12-12v-68h-68c-6.6 0-12-5.4-12-12v-24c0-6.6 5.4-12 12-12h68v-68c0-6.6 5.4-12 12-12h24c6.6 0 12 5.4 12 12v68h68c6.6 0 12 5.4 12 12zm196.5 289.9l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L347.5 387.1c-2.3-2.3-3.5-5.3-3.5-8.5v-13.2c-36.5 31.5-84 50.6-136 50.6C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208c0 52-19.1 99.5-50.6 136h13.2c3.2 0 6.2 1.3 8.5 3.5l121.4 121.4c4.7 4.7 4.7 12.3 0 17zM368 208c0-88.4-71.6-160-160-160S48 119.6 48 208s71.6 160 160 160 160-71.6 160-160z"></path></svg></a>'
		}]
	});

	table.on( 'click', '.result', function() {
		var data = table.row($(this).parents('tr')).data();
		window.open(data[ 6 ], '_blank');
	});


	$('#pool_filter input').attr("placeholder", "search...");
});



// calculator
$(document).ready(function() {

	// Taken from https://stackoverflow.com/questions/1909441/how-to-delay-the-keyup-handler-until-the-user-stops-typing
	var delay = (function(){
		var timer = 0;
		return function(callback, ms){
			clearTimeout (timer);
			timer = setTimeout(callback, ms);
		};
	})();

	var userXLM;
	var totalCoins;
	var feePool;
	var $calcInput = $('.calculator input');
	var $calcResult = $('.calculator span');
	const server = new StellarSdk.Server('https://horizon.stellar.org');
	StellarSdk.Network.usePublicNetwork();

	var getXLMAmount = function(xlmOrAddress) {
		return new Promise(function(resolve, reject){
			// check for XLM amount or valid address
			userXLM = parseFloat(xlmOrAddress);
			if (!isNaN(userXLM)) {
				resolve(userXLM);
			} else if (StellarSdk.StrKey.isValidEd25519PublicKey(xlmOrAddress)) {
				var userAddress = xlmOrAddress;
				server.loadAccount(userAddress)
				.then((account) => {
					console.log(account);
					const nativeBalance = account.balances.find((el) => {return el.asset_type === 'native';});
					userXLM = nativeBalance.balance;
					resolve(userXLM);
				}, (fail) => {
					console.log('failed to fetch user account in calculator - error: ', fail);
					reject();
				});
			} else {
				// not a valid XLM amount or valid address
				reject();
			}
		});

	};

	var getLatestLedgerInfo = function() {
		return new Promise(function(resolve, reject){
			if (totalCoins && feePool) {
				// We got the value cached, no need to hit the API
				resolve();
			} else {

				// Hit the API
				server.ledgers().limit(1).order('desc').call()
				.then(({records}) => {
					feePool = records[0].fee_pool;
					totalCoins = records[0].total_coins;
					resolve();
				}, (fail) => {
					console.log('failed to fetch ledger in calculator - errror: ', fail);
					reject();
				});
			}
		});
	};

	// Our main listener
	$calcInput.keyup(function() {
		delay(function(){
			// 1. Get XLM Amount AND get totalCoin + feePool
			// 2. Calculate inflation
			// 3. Update
			Promise.all([getXLMAmount($calcInput.val().replace(/,/g, '')), getLatestLedgerInfo()])
			.then(function([XLMAmount, _]){
				// weekly inlation rate set in stellar core code - https://github.com/stellar/stellar-core/blob/master/src/transactions/InflationOpFrame.cpp
				var total = Math.max((XLMAmount * 0.000190721) + (userXLM * feePool / totalCoins ) - 0.0000100, 0.0);

				// This is not accurate and also slowwwww
				$calcResult.html('Estimated payout = <strong>' + Number((total).toFixed(7)) + '</strong> XLM');
			})
			.catch(function(e){
				console.log("Please check your address / XLM amount!");
				$calcResult.html(0);
			});
		}, 400 );
  	});
});



// i18n
$(document).ready(() => {
	var translate = null;

	// Method to translate into the specified language
	function translateInto(lang) {
		// Getting all the nodes having a 'data-i18n' attribute
		const nodes = document.querySelectorAll('[data-i18n]');

		// Fetching the matched JSON translation file
		$.get({
			url: './assets/js/i18n/' + lang + '.json'
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

	$('.lang .en').click(function () {
		translateInto('en_US');
	});

	$('.lang .es').click(function () {
		translateInto('es_ES');
	});

	$('.lang .pt').click(function () {
		translateInto('pt_PT');
	});

	$('.lang .br').click(function () {
		translateInto('pt_BR');
	});

	$('.lang .it').click(function () {
		translateInto('it_IT');
	});

	$('.lang .fr').click(function () {
		translateInto('fr_FR');
	});

	$('.lang .de').click(function () {
		translateInto('de_DE');
	});

	$('.lang .ru').click(function () {
		translateInto('ru_RU');
	});
});



// price ticker
$(document).ready(function() {

    var currentPrice = {};
    var socket = io.connect('https://streamer.cryptocompare.com/');
    //Format: {SubscriptionId}~{ExchangeName}~{FromSymbol}~{ToSymbol}
    //Use SubscriptionId 0 for TRADE, 2 for CURRENT and 5 for CURRENTAGG
    //For aggregate quote updates use CCCAGG as market
    var subs = ['5~CCCAGG~XLM~USD', '5~CCCAGG~XLM~BTC'];
    socket.emit('SubAdd', { subs });
    socket.on("m", function(message) {
        var messageType = message.substring(0, message.indexOf("~"));
        var res = {};
        if (messageType == CCC.STATIC.TYPE.CURRENTAGG) {
            res = CCC.CURRENT.unpack(message);
            dataUnpack(res);
        }
    });

    var dataUnpack = function(data) {
        var fromSym = data['FROMSYMBOL'];
        var toSym = data['TOSYMBOL'];
        var fsym = CCC.STATIC.CURRENCY.getSymbol(fromSym);
        var tsym = CCC.STATIC.CURRENCY.getSymbol(toSym);
        var pair = fromSym + '-' + toSym;

        if (!currentPrice.hasOwnProperty(pair)) {
            currentPrice[pair] = {};
        }

        for (var key in data) {
            currentPrice[pair][key] = data[key];
        }

        if (currentPrice[pair]['LASTTRADEID']) {
            currentPrice[pair]['LASTTRADEID'] = parseInt(currentPrice[pair]['LASTTRADEID']).toFixed(0);
        }
        currentPrice[pair]['CHANGE24HOUR'] = CCC.convertValueToDisplay(tsym, (currentPrice[pair]['PRICE'] - currentPrice[pair]['OPEN24HOUR']));
        currentPrice[pair]['CHANGE24HOURPCT'] = ((currentPrice[pair]['PRICE'] - currentPrice[pair]['OPEN24HOUR']) / currentPrice[pair]['OPEN24HOUR'] * 100).toFixed(2) + "%";;
        displayData(currentPrice[pair], fromSym, toSym, pair);
    };

    var displayData = function(current, fromSym, toSym, pairSym) {
        // console.log('current: ', current, fromSym, toSym, pairSym, CCC.STATIC.CURRENCY.getSymbol(toSym));

        $('#price_' + pairSym).text(current.PRICE);
        $('#change24HourPct_' + pairSym).text(' (' + current.CHANGE24HOURPCT + ')');

        var priceDirection = current.FLAGS;
        $('#price_' + pairSym).removeClass();
        if (priceDirection & 1) {
            $('#price_' + pairSym).addClass("highlight-green");
        }
        else if (priceDirection & 2) {
            $('#price_' + pairSym).addClass("highlight-red");
        }
        if (current['PRICE'] > current['OPEN24HOUR']) {
            $('#change24HourPct_' + pairSym).removeClass();
            $('#change24HourPct_' + pairSym).addClass("price_up");
        }
        else if (current['PRICE'] < current['OPEN24HOUR']) {
            $('#change24HourPct_' + pairSym).removeClass();
            $('#change24HourPct_' + pairSym).addClass("price_down");
        }
    };
});



// close button/key
$(document).on('click', 'section > .close', function(e) {
	e.preventDefault();
	document.location.hash = "";
});
$(document).keypress(function(e) {
	var keycode = e.keyCode || e.which;
	if(keycode == '27') {
		document.location.hash = "";
	}
});


// Setup & Instructions
$(document).ready(function() {
	const POOL_ADDRESS = 'GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT';
	const $castVoteTab = $('#cast');
	const $instructions = $('.instructions');
	const $walletLogos = $('.wallet-logos');
	const $addrInput = $('#confirm input');
	const $verifyButton = $('#confirm button');
	const $verifyResult = $('#confirm-result');

	const instructionsState = {};
	const wallet_to_custom_instructions = {
		'stellar-desktop-client': 'stellar-desktop-client',
		'ledger': 'ledger-nano'
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
				"<p class=\"alert alert-warning\">Invalid address. Try copy-pasting again.</p>"
			);
			return;
		}

		try {
			server.loadAccount(pubKey).then((account) => {
				console.log(account);

				if (account.inflation_destination != POOL_ADDRESS) {
					$verifyResult.empty();
					$verifyResult.append(
						"<p class=\"alert alert-warning\">Hmmm. Looks like you're not in the pool yet.</p>"
					);
				} else {
					$verifyResult.empty();
					$verifyResult.append(
						"<p class=\"alert alert-success\">Success! Welcome to the pool and thanks for your support.</p>"
					);
				}
			});
		} catch(err) {
			console.log(err);

			$verifyResult.empty();

			$verifyResult.append(
				"<p class=\"alert alert-warning\">Error fetching account info. Please try again later.</p>"
			);
			return;
		}
	}
});

// lumenaut payments export

var loadedPayments = [];

document.getElementById("load").onclick = function () {
	lumenaut = 'GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT';
	address = document.getElementById('address').value;

	if (!address) {
		console.error("Your Public Key is missing!");
		return;
	}

	var timeFrameValue = document.getElementById("timeframe").value;
	endDate = moment();
	startDate = moment().subtract(30, 'days').startOf('day');

	switch (timeFrameValue) {
		case 'year':
			startDate = moment().subtract(1, 'year').startOf('day');
			break;
		case 'prevYear':
			endDate = moment().startOf('year');
			timeFrameValue
			startDate = moment().startOf('year').subtract(1, 'year');
			break;
	}

	var url = 'https://horizon.stellar.org/accounts/' + address + '/payments?limit=200&order=desc'

	getData(url, lumenaut, startDate, endDate, function (payments) {
		loadedPayments = payments;
		var dataTable = document.getElementById("data");
		dataTable.innerHTML = '';

		payments.forEach(function (payment) {
			dataTable.innerHTML += `<tr><td>${payment.date.format()}</td><td>${payment.amount}</td></tr>`;
		});

		document.getElementById("csv").disabled = false;
	});
}

document.getElementById("csv").onclick = function () {
	var lumenaut = 'GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT';
	var timeFrameValue = document.getElementById("timeframe").value;

	//create csv
	var csvFile = 'Date,Amount(XLM)';
	loadedPayments.forEach(function (payment) {
		csvFile += '\n' + payment.date.format() + ',' + payment.amount;
	})

	//download as file
	var a = document.createElement('a');
	var file = new Blob([csvFile], {
		type: 'csv'
	});
	a.href = URL.createObjectURL(file);
	a.download = `${lumenaut.substring(0,6)}_${timeFrameValue}_PaymentsExport.csv`;
	a.click();
}

function getData(url, lumenaut, startDate, endDate, callback) {

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			var payments = JSON.parse(xmlHttp.responseText);
			processPayments(payments, lumenaut, startDate, endDate, callback);
		}
		else if (xmlHttp.status == 404) {
			callback([]);
		}
	}

	xmlHttp.open("GET", url, true);
	xmlHttp.send(null);
}

function processPayments(payments, lumenaut, startDate, endDate, callback) {
	var paymentsOfInterest = [];
	var lastPaymentDate;
	var records = payments['_embedded'].records;

	if (records.length == 0) {
		callback(paymentsOfInterest);
		return;
	}

	records.forEach(function (payment) {
		lastPaymentDate = moment(payment['created_at']);

		if (!lastPaymentDate.isBetween(startDate, endDate)) {
			return;
		}

		if (payment['source_account'] == lumenaut) {

			paymentsOfInterest.push({
				date: lastPaymentDate,
				amount: payment.amount
			});
		}
	});

	if (lastPaymentDate.isAfter(startDate))
		getData(payments['_links'].next.href, lumenaut, startDate, endDate, function (newPayments) {
			callback(paymentsOfInterest.concat(newPayments));
	});
	else
		callback(paymentsOfInterest);
}
