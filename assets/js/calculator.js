$(document).ready(function() {

  // Taken from
  // https://stackoverflow.com/questions/1909441/how-to-delay-the-keyup-handler-until-the-user-stops-typing
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
  var $calculatorInput = $('#calculator-input');
  var $calculatorResult = $('#calculator-result');


  var getXLMAmount = function(xlmOrAddress) {
      return new Promise(function(resolve, reject){
        // assume XLM is inserted
        userXLM = parseFloat(xlmOrAddress);
        if (!isNaN(userXLM)) {

          resolve(userXLM);

        } else {

          // Not valid lumens, assume it's an address
          var userAddress = xlmOrAddress;

          // TODO: Validate that it looks like an address before hitting the api
          $.get('https://horizon.stellar.org/accounts/' + userAddress)

            .done(function(data){
              // TODO: Look for native assets only, this might break if user has
              // multiple assets
              userXLM = data.balances[0].balance;
              resolve(userXLM);

            })
            .fail(function(){ reject(); });

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
        $.get('https://horizon.stellar.org/ledgers?order=desc&limit=1')
          .done(function(data){
            // save to cache and resolve
            totalCoins = data._embedded.records[0].total_coins;
            feePool = data._embedded.records[0].fee_pool;
            resolve();
          })
          .fail(function(){ reject(); });
      }
    });
  };


  // Our main listener
  $('#calculator-input').keyup(function() {

    delay(function(){
      // 1. Get XLM Amount AND get totalCoin + feePool
      // 2. Calculate inflation
      // 3. Update
      Promise.all([getXLMAmount($calculatorInput.val()), getLatestLedgerInfo()])
        .then(function([XLMAmount, _]){
          // weekly inlation rate set in stellar core code - https://github.com/stellar/stellar-core/blob/master/src/transactions/InflationOpFrame.cpp
          var total = (XLMAmount * 0.000190721) + (userXLM * feePool / totalCoins ) - 0.0000100

          // This is not accurate and also slowwwww
          $calculatorResult.html(Number((total).toFixed(7)));
        })
        .catch(function(e){
          console.log("Please check your address / XLM amount!" +  e);
        });

    }, 400 );
  });


});
