const bip32Path = "44'/148'/0'";
const POOL_ADDRESS = 'GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT';

$(document).ready(function() {
  var ledgerLoadingEl = $(".ledger-loading");
  var ledgerAvailableEl = $(".ledger-available");
  var ledgerErrorEl = $(".ledger-error");
  var publicKeyEl = $(".ledger-public-key");
  var castVoteButtonEl = $("#ledger-cast-vote");
  var transactionXDREl = $(".ledger-transaction-xdr");

  StellarLedger.comm.create_async(2).then(function(comm) {
    var api = new StellarLedger.Api(comm);
    return api.getPublicKey_async(bip32Path).then(function (result) {
      var publicKey = result.publicKey;
      showPublicKey(publicKey);
      castVoteButtonEl.click(function() {
        createTransaction(api, publicKey).then(function(transaction) {
          castVoteButtonEl.hide();

          transactionXDREl
            .text(transaction.toEnvelope().toXDR("base64"))
            .show();
        });
      });

    }).catch(showError);
  });

  function showPublicKey(publicKey) {
    ledgerLoadingEl.hide();
    ledgerAvailableEl.show();

    publicKeyEl.text(publicKey);
    publicKeyEl.attr("href", publicKeyURL(publicKey));
  }

  function createTransaction(api, publicKey) {
    var server = new StellarSdk.Server('https://horizon.stellar.org');

    var createTransaction = server.loadAccount(publicKey).then(function(account) {
      var transaction = new StellarSdk.TransactionBuilder(account)
        .addOperation(
          StellarSdk.Operation.setOptions({
            inflationDest: POOL_ADDRESS
          })
        ).build();

      return Promise.resolve(transaction);
    });
    var signTransaction = createTransaction.then(function(transaction) {
      return api.signTx_async(bip32Path, transaction).then(function(result) {
        return result.signature;
      });
    });

    return Promise.all([
      publicKey,
      createTransaction,
      signTransaction
    ]).then(function([publicKey, transaction, signature]) {
      var keyPair = StellarSdk.Keypair.fromPublicKey(publicKey);
      var hint = keyPair.signatureHint();
      var decorated = new StellarSdk.xdr.DecoratedSignature({
        hint: hint,
        signature: signature
      });
      transaction.signatures.push(decorated);
      return transaction;
    });

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
