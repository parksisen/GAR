window.msgpack = this.msgpack;

(function(){
    var _WebSocket = window._WebSocket = window.WebSocket;
    var $ = window.jQuery;
    var msgpack = window.msgpack;
    var options = {
        enableMultiCells: true,
        enableCross: true
    };

    //Параметры игры
    var agar_server = null;
    var map_server = null;
    var player_name = [];
    var players = [];
    var id_players = [];
    var cells = [];
    var current_cell_ids = [];
    var start_x = -7000,
        start_y = -7000,
        end_x = 7000,
        end_y = 7000,
        length_x = 14000,
        length_y = 14000;
    var render_timer = null;
    var rendTime = 0;
    function miniMapSendRawData(data) {
        if (map_server !== null && map_server.readyState === window._WebSocket.OPEN) {
            var array = new Uint8Array(data);
            map_server.send(array.buffer);
        }
    }

    /*-------------------------------------------Рендер миникарты-------------------------------------------------*/
    function miniMapRender() {
        var canvas = window.mini_map;
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rendTime++;
        if (rendTime>=20) {
            rendTime= 0;
            miniMapReset();
        } else {
        for (var id in window.mini_map_tokens) {
            var token = window.mini_map_tokens[id];
            var x = token.x * canvas.width;
            var y = token.y * canvas.height;
            var size = token.size * canvas.width;

            ctx.beginPath();
            ctx.arc(
                x,
                y,
                size,
                0,
                2 * Math.PI,
                false
            );
            ctx.closePath();
            ctx.fillStyle = token.color;
            ctx.fill();

            if (options.enableCross && -1 != current_cell_ids.indexOf(token.id))
                miniMapDrawCross(token.x, token.y, token.color);

            if (options.enableAxes && -1 != current_cell_ids.indexOf(token.id))
                miniMapDrawMiddleCross();

            if (id_players[id] !== undefined) {
                // Draw you party member's crosshair
                if (options.enableCross) {
                    miniMapDrawCross(token.x, token.y, token.color);
                }

                ctx.font = size * 2 + 'px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'white';
                ctx.fillText(id_players[id] + 1, x, y);
            }
        }
        }
    }

    function miniMapDrawCross(x, y, color) {
        var canvas = window.mini_map;
        var ctx = canvas.getContext('2d');
        ctx.lineWidth = 5;
        //ctx.beginPath();
        ctx.moveTo(0, y * canvas.height);
        ctx.lineTo(3, y * canvas.height);
        ctx.moveTo(x * canvas.width, 0);
        ctx.lineTo(x * canvas.width, 3);
        ctx.closePath();
        ctx.strokeStyle = '#33FF33';
        ctx.stroke();
    }
    /*-----------------------------------------Рендер миникарты:END-----------------------------------------------*/
    
    

    function miniMapCreateToken(id, color) {
        var mini_map_token = {
            id: id,
            color: color,
            x: 0,
            y: 0,
            size: 0
        };
        return mini_map_token;
    }

    function miniMapRegisterToken(id, token) {
        if (window.mini_map_tokens[id] === undefined) {
            window.mini_map_tokens[id] = token;
        }
    }

    function miniMapUnregisterToken(id) {
        if (window.mini_map_tokens[id] !== undefined) {
            delete window.mini_map_tokens[id];
        }
    }

    function miniMapIsRegisteredToken(id) {
        return window.mini_map_tokens[id] !== undefined;

    }

    function miniMapUpdateToken(id, x, y, size) {
        if (window.mini_map_tokens[id] !== undefined) {

            window.mini_map_tokens[id].x = x;
            window.mini_map_tokens[id].y = y;
            window.mini_map_tokens[id].size = size;

            return true;
        } else {
            return false;
        }
    }

    function miniMapUpdatePos(x, y) {
        window.mini_map_pos.text('x: ' + x.toFixed(0) + ', y: ' + y.toFixed(0));
    }

    function miniMapReset() {
        cells = [];
        window.mini_map_tokens = [];
    }

    function miniMapInit() {
        window.mini_map_tokens = [];

        cells = [];
        current_cell_ids = [];
        start_x = -7000;
        start_y = -7000;
        end_x = 7000;
        end_y = 7000;
        length_x = 14000;
        length_y = 14000;

        //Дерево мини-карты
        if ($('#mini-map-wrapper').length === 0){
            var wrapper = $('<div>').attr('id', 'mini-map-wrapper').css({position: 'fixed',zIndex: '1000',bottom: 10,right: 10,width: 160,height: 160});
            
            //Скрываем недостатки
			$(".tosBox").hide();
            $(".agario-promo").hide();
            $("#mainPanel").find("hr").hide();
            $("#mainPanel").find("center").hide();
            //jQuery("body").append("<div style='width:300px;height:100px;position:fixed;left:10px;bottom:10px;border:1px solid black;background:#fff;' id='qqk'></div>");
            
            var setka = $("<div id='setka' style='width:160px;height:160px;position:fixed;bottom:10px;right:10px;'><table width='100%' height='100%'><tr><td>A1</td><td>A2</td><td>A3</td><td>A4</td></tr><tr><td>B1</td><td>B2</td><td>B3</td><td>B4</td></tr><tr><td>C1</td><td>C2</td><td>C3</td><td>C4</td></tr><tr><td>D1</td><td>D2</td><td>D3</td><td>D4</td></tr></table></div>");
			setka.appendTo(document.body);
            $("#setka table").css({"borderSpacing":"0px","font":"normal 10px Arial","background": '#303030'});
            $("#setka table tr>td").css({"textAlign":"center","border":"1px solid #505050","color":"#707070"});
            
			
            var mini_map = $('<canvas>').attr({id: 'mini-map',width: 160,height: 160}).css({width: '100%',height: '100%',position: 'relative'});
            wrapper.append(mini_map).appendTo(document.body);

            window.mini_map = mini_map[0];
        }

        //Обработчик мини-карты
        if (render_timer === null)
            render_timer = setInterval(miniMapRender, 1000 / 10);

        //Позиция мини-карты
        if ($('#mini-map-pos').length === 0) {
            window.mini_map_pos = $('<div>').attr('id', 'mini-map-pos').css({
                bottom: 10,
                right: 10,
                color: 'white',
                fontSize: 15,
                fontWeight: 800,
                position: 'fixed'
            }).appendTo(document.body);
        }
    }

    // cell constructor
    function Cell(id, x, y, size, color, name) {
        cells[id] = this;
        this.id = id;
        this.ox = this.x = x;
        this.oy = this.y = y;
        this.oSize = this.size = size;
        this.color = color;
        this.points = [];
        this.pointsAcc = [];
        this.setName(name);
    }

    Cell.prototype = {
        id: 0,
        points: null,
        pointsAcc: null,
        name: null,
        nameCache: null,
        sizeCache: null,
        x: 0,
        y: 0,
        size: 0,
        ox: 0,
        oy: 0,
        oSize: 0,
        nx: 0,
        ny: 0,
        nSize: 0,
        updateTime: 0,
        updateCode: 0,
        drawTime: 0,
        destroyed: false,
        isVirus: false,
        isAgitated: false,
        wasSimpleDrawing: true,

        destroy: function() {
            delete cells[this.id];
            id = current_cell_ids.indexOf(this.id);
            -1 != id && current_cell_ids.splice(id, 1);
            this.destroyed = true;
            if (map_server === null || map_server.readyState !== window._WebSocket.OPEN){
                miniMapUnregisterToken(this.id);
            }
        },
        setName: function(name) {
            this.name = name;
        },
        updatePos: function() {
            if (map_server === null || map_server.readyState !== window._WebSocket.OPEN) {
                if (options.enableMultiCells || -1 != current_cell_ids.indexOf(this.id)) {
                    if (!miniMapIsRegisteredToken(this.id))
                    {
                        miniMapRegisterToken(
                            this.id,
                            miniMapCreateToken(this.id, this.color)
                        );
                    }

                    var size_n = this.nSize/length_x;
                    miniMapUpdateToken(this.id, (this.nx - start_x)/length_x, (this.ny - start_y)/length_y, size_n);
                }
            }
/*
            if (options.enablePosition && -1 != current_cell_ids.indexOf(this.id)) {
                window.mini_map_pos.show();
                miniMapUpdatePos(this.nx, this.ny);
            } else {
                window.mini_map_pos.hide();
            }*/

        }
    };

    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    function camel2cap(str) {
        return str.replace(/([A-Z])/g, function(s){return ' ' + s.toLowerCase();}).capitalize();
    };

    // create a linked property from slave object
    // whenever master[prop] update, slave[prop] update
    function refer(master, slave, prop) {
        Object.defineProperty(master, prop, {
            get: function(){
                return slave[prop];
            },
            set: function(val) {
                slave[prop] = val;
            },
            enumerable: true,
            configurable: true
        });
    };

    // extract a websocket packet which contains the information of cells
    function extractCellPacket(data, offset) {
        ////
        var dataToSend = {
            destroyQueue : [],
            nodes : [],
            nonVisibleNodes : []
        };
        ////

        var I = +new Date;
        var qa = false;
        var b = Math.random(), c = offset;
        var size = data.getUint16(c, true);
        c = c + 2;

        // Nodes to be destroyed (killed)
        for (var e = 0; e < size; ++e) {
            var p = cells[data.getUint32(c, true)],
                f = cells[data.getUint32(c + 4, true)],
                c = c + 8;
            p && f && (
                f.destroy(),
                f.ox = f.x,
                f.oy = f.y,
                f.oSize = f.size,
                f.nx = p.x,
                f.ny = p.y,
                f.nSize = f.size,
                f.updateTime = I,
                dataToSend.destroyQueue.push(f.id));

        }

        // Nodes to be updated
        for (e = 0; ; ) {
            var d = data.getUint32(c, true);
            c += 4;
            if (0 == d) {
                break;
            }
            ++e;
            var p = data.getInt32(c, true),
                c = c + 4,
                f = data.getInt32(c, true),
                c = c + 4;
                g = data.getInt16(c, true);
                c = c + 2;
            for (var h = data.getUint8(c++), m = data.getUint8(c++), q = data.getUint8(c++), h = (h << 16 | m << 8 | q).toString(16); 6 > h.length; )
                h = "0" + h;

            var h = "#" + h,
                k = data.getUint8(c++),
                m = !!(k & 1),
                q = !!(k & 16);

            k & 2 && (c += 4);
            k & 4 && (c += 8);
            k & 8 && (c += 16);

            for (var n, k = ""; ; ) {
                n = data.getUint16(c, true);
                c += 2;
                if (0 == n)
                    break;
                k += String.fromCharCode(n)
            }

            n = k;
            k = null;

            var updated = false;
            // if d in cells then modify it, otherwise create a new cell
            cells.hasOwnProperty(d)
                ? (k = cells[d],
                   k.updatePos(),
                   k.ox = k.x,
                   k.oy = k.y,
                   k.oSize = k.size,
                   k.color = h,
                   updated = true)
                : (k = new Cell(d, p, f, g, h, n),
                   k.pX = p,
                   k.pY = f);

            k.isVirus = m;
            k.isAgitated = q;
            k.nx = p;
            k.ny = f;
            k.nSize = g;
            k.updateCode = b;
            k.updateTime = I;
            n && k.setName(n);

            // ignore food creation
            if (updated) {
                dataToSend.nodes.push({
                    id: k.id,
                    x: k.nx,
                    y: k.ny,
                    size: k.nSize,
                    color: k.color
                });
            }
        }

        // Destroy queue + nonvisible nodes
        b = data.getUint32(c, true);
        c += 4;
        for (e = 0; e < b; e++) {
            d = data.getUint32(c, true);
            c += 4, k = cells[d];
            null != k && k.destroy();
            dataToSend.nonVisibleNodes.push(d);
        }

        var packet = {
            type: 16,
            data: dataToSend
        }

        miniMapSendRawData(msgpack.pack(packet));
    }

    // extract the type of packet and dispatch it to a corresponding extractor
    function extractPacket(event) {
        var c = 0;
        var data = new DataView(event.data);
        240 == data.getUint8(c) && (c += 5);
        var opcode = data.getUint8(c);
        c++;
        switch (opcode) {
            case 16: // cells data
                extractCellPacket(data, c);
                break;
            case 20: // cleanup ids
                current_cell_ids = [];
                break;
            case 32: // cell id belongs me
                var id = data.getUint32(c, true);

                if (current_cell_ids.indexOf(id) === -1)
                    current_cell_ids.push(id);

                miniMapSendRawData(msgpack.pack({
                    type: 32,
                    data: id
                }));
                break;
            case 64: // get borders
                start_x = data.getFloat64(c, !0), c += 8,
                start_y = data.getFloat64(c, !0), c += 8,
                end_x = data.getFloat64(c, !0), c += 8,
                end_y = data.getFloat64(c, !0), c += 8,
                center_x = (start_x + end_x) / 2,
                center_y = (start_y + end_y) / 2,
                length_x = Math.abs(start_x - end_x),
                length_y = Math.abs(start_y - end_y);
        }
    };

    function extractSendPacket(data) {
        var view = new DataView(data);
        switch (view.getUint8(0, true)) {
            case 0:
                player_name = [];
                for (var i=1; i < data.byteLength; i+=2) {
                    player_name.push(view.getUint16(i, true));
                }

                miniMapSendRawData(msgpack.pack({
                    type: 0,
                    data: player_name
                }));
                break;
        }
    }

    // the injected point, overwriting the WebSocket constructor
    window.WebSocket = function(url, protocols) {
        console.log('Listen');

        if (protocols === undefined) {
            protocols = [];
        }

        var ws = new _WebSocket(url, protocols);

        refer(this, ws, 'binaryType');
        refer(this, ws, 'bufferedAmount');
        refer(this, ws, 'extensions');
        refer(this, ws, 'protocol');
        refer(this, ws, 'readyState');
        refer(this, ws, 'url');

        this.send = function(data){
            extractSendPacket(data);
            return ws.send.call(ws, data);
        };

        this.close = function(){
            return ws.close.call(ws);
        };

        this.onopen = function(event){};
        this.onclose = function(event){};
        this.onerror = function(event){};
        this.onmessage = function(event){};

        ws.onopen = function(event) {
            miniMapInit();
            agar_server = url;
            miniMapSendRawData(msgpack.pack({
                type: 100,
                data: {url: url, region: $('#region').val(), gamemode: $('#gamemode').val(), party: location.hash}
            }));
            if (this.onopen)
                return this.onopen.call(ws, event);
        }.bind(this);

        ws.onmessage = function(event) {
            extractPacket(event);
            if (this.onmessage)
                return this.onmessage.call(ws, event);
        }.bind(this);

        ws.onclose = function(event) {
            if (this.onclose)
                return this.onclose.call(ws, event);
        }.bind(this);

        ws.onerror = function(event) {
            if (this.onerror)
                return this.onerror.call(ws, event);
        }.bind(this);
    };

    window.WebSocket.prototype = _WebSocket;

    $(window.document).ready(function() {
        miniMapInit();
    });
	
    $(window).load(function() {
        var main_canvas = document.getElementById('canvas');
        if (main_canvas && main_canvas.onmousemove) {
            document.onmousemove = main_canvas.onmousemove;
            main_canvas.onmousemove = null;
        }
    });
})();