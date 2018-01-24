$(document).ready(function() {

  // Taken from
  // https://stackoverflow.com/questions/1909441/how-to-delay-the-keyup-handler-until-the-user-stops-typing
  var delay = (function() {
    var timer = 0;
    return function(callback, ms) {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  })();


  var userXLM;
  var totalCoins;
  var feePool;
  var $calculatorInput = $('#calculator-input');
  var $calculatorResult = $('#calculator-result');
  const server = new StellarSdk.Server('https://horizon.stellar.org');
  StellarSdk.Network.usePublicNetwork();


  var getXLMAmount = function(xlmOrAddress) {
    return new Promise(function(resolve, reject) {
      // check for XLM amount or valid address
      userXLM = parseFloat(xlmOrAddress);
      if (!isNaN(userXLM)) {
        resolve(userXLM);
      } else if (StellarSdk.StrKey.isValidEd25519PublicKey(xlmOrAddress)) {
        var userAddress = xlmOrAddress;
        server.loadAccount(userAddress)
          .then((account) => {
            console.log(account);
            const nativeBalance = account.balances.find((el) => {
              return el.asset_type === 'native';
            });
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

    return new Promise(function(resolve, reject) {

      if (totalCoins && feePool) {
        // We got the value cached, no need to hit the API
        resolve();
      } else {

        // Hit the API
        server.ledgers().limit(1).order('desc').call()
          .then(({
            records
          }) => {
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
  $('#calculator-input').keyup(function() {

    delay(function() {
      // 1. Get XLM Amount AND get totalCoin + feePool
      // 2. Calculate inflation
      // 3. Update
      Promise.all([getXLMAmount($calculatorInput.val()), getLatestLedgerInfo()])
        .then(function([XLMAmount, _]) {
          // weekly inlation rate set in stellar core code - https://github.com/stellar/stellar-core/blob/master/src/transactions/InflationOpFrame.cpp
          var total = Math.max((XLMAmount * 0.000190721) + (userXLM * feePool / totalCoins) - 0.0000100, 0.0);

          // This is not accurate and also slowwwww
          $calculatorResult.html(Number((total).toFixed(7)));
        })
        .catch(function(e) {
          console.log("Please check your address / XLM amount!");
          $calculatorResult.html(0);
        });

    }, 400);
  });


});
