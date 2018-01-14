$(document).ready(function() {

    var currentPrice = {};
    var socket = io.connect('https://streamer.cryptocompare.com/');
    //Format: {SubscriptionId}~{ExchangeName}~{FromSymbol}~{ToSymbol}
    //Use SubscriptionId 0 for TRADE, 2 for CURRENT and 5 for CURRENTAGG
    //For aggregate quote updates use CCCAGG as market
    var subs = ['5~CCCAGG~XLM~USD', '5~CCCAGG~XLM~BTC', '5~CCCAGG~XLM~ETH'];
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
