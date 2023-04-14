function BroadCast(message) {
    this.message = message;
}

module.exports = BroadCast;


BroadCast.prototype.build = function () {
    var nick = "ADMIN \uD83D\uDCE2";
    var buf = new ArrayBuffer(9 + 2 * nick.length + 2 * this.message.length);
    var view = new DataView(buf);
    view.setUint8(0, 99);
    view.setUint8(1, 242);
    view.setUint8(2, 242);
    view.setUint8(3, 242);
    view.setUint8(4, 242);
    var offset = 5;
    for (var j = 0; j < nick.length; j++) {
        view.setUint16(offset, nick.charCodeAt(j), true);
        offset += 2;
    }
    view.setUint16(offset, 0, true);
    offset += 2;
    for (var j = 0; j < this.message.length; j++) {
        view.setUint16(offset, this.message.charCodeAt(j), true);
        offset += 2;
    }
    view.setUint16(offset, 0, true);
    offset += 2;
    return buf;
    
};
