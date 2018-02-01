$(document).ready(function() {
  var bip32Path = "44'/148'/0'";

  var ledgerLoadingEl = $(".ledger-loading");
  var ledgerAvailableEl = $(".ledger-available");
  var ledgerErrorEl = $(".ledger-error");
  var publicKeyEl = $(".ledger-public-key");
  StellarLedger.comm.create_async(2).then(function(comm) {
    var api = new StellarLedger.Api(comm);
    return api.getPublicKey_async(bip32Path).then(function (result) {
      showPublicKey(result.publicKey);
    }).catch(showError);
  });

  function showPublicKey(publicKey) {
    ledgerLoadingEl.hide();
    ledgerAvailableEl.show();

    publicKeyEl.text(publicKey);
    publicKeyEl.attr("href", publicKeyURL(publicKey));
  }

  function showError(error) {
    console.error(error);
    $(ledgerAvailableEl).hide();
    $(ledgerLoadingEl).hide();
    $(ledgerErrorEl).show();
  }

  function publicKeyURL(publicKey) {
    return "https://horizon.stellar.org/accounts/" + publicKey;
  }
});
