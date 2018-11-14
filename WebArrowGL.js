L.WebGLArrow = L.Renderer.extend({
    version: '0.0.1',

    options: {
        opacity: 1,
        vertexShaderContent: null,
        fragmentShadercontent: null,
        arrowlength: 10,
        arrowwidth: 4,
        data: null,
    },

    _initContainer: function () {
        var container = this._container = L.DomUtil.create('canvas', 'leaflet-zoom-animated'),
            options = this.options;

        container.id = 'webgl-leaflet-' + L.Util.stamp(this);
        container.style.opacity = options.opacity;
        container.style.position = 'absolute';
        container.style.zIndex = 100;
        this.initWebGL();

        if (this.width == null) {
            this.width = this.canvas.offsetWidth || 2;
        }
        if (this.height == null) {
            this.height = this.canvas.offsetHeight || 2;
        }
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.gl.viewport(0, 0, this.width, this.height);

        this.originarrow = this.GenerateArrow(this.options.arrowlength, this.options.arrowwidth);

        this.options.data = this.DealDataWithAngle();
    },

    DealDataWithAngle: function () {
        var coordsangle = [];
        for (var i = 0; i < this.options.data.length; i += 4) {
            coordsangle.push(this.options.data[i]);
            coordsangle.push(this.options.data[i + 1]);
            var arrowcoordlen=Math.sqrt(this.options.data[i+2]*this.options.data[i+2]+this.options.data[i+3]*this.options.data[i+3]);
            coordsangle.push(arrowcoordlen);
            coordsangle.push(Math.atan2(this.options.data[i + 3], this.options.data[i + 2]));
        }
        return new Float32Array(coordsangle);
    },

    onAdd: function () {
        L.Renderer.prototype.onAdd.call(this);
        this.resize();
    },

    _destroyContainer: function () {
        delete this.gl;
        L.DomUtil.remove(this._container);
        L.DomEvent.off(this._container);
        delete this._container;
    },

    getEvents: function () {
        var events = L.Renderer.prototype.getEvents.call(this);

        L.Util.extend(events, {
            resize: this.resize,
            move: L.Util.throttle(this._update, 49, this)
        });
        return events;
    },

    resize: function () {
        var canvas = this._container,
            size = this._map.getSize();

        canvas.width = size.x;
        canvas.height = size.y;

        this.adjustSize();
        this.draw();
    },

    reposition: function () {
        var pos = this._map
            ._getMapPanePos()
            .multiplyBy(-1);

        L.DomUtil.setPosition(this._container, pos);
    },

    _update: function () {
        L.Renderer.prototype._update.call(this);
        this.draw();
    },

    //webgl绘制
    draw: function () {
        var map = this._map;
        if (!this.options.data) return;
        //clear last draw

        this.reposition();
        //开启混合
        //this.gl.enable(this.gl.BLEND);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        this.data = [];
        //translate coords to pixel
        for (var i = 0; i < this.options.data.length; i += 4) {
            var ll = L.latLng(this.options.data[i + 1], this.options.data[i])
            var arrowpixellen=this.options.data[i+2]*100/this.MeterOneDrawUnit();
            if(arrowpixellen<3) continue;
            var point = this._map.latLngToContainerPoint(ll);
            var originarrow=this.GenerateArrow(arrowpixellen,4);
            var newtriangle = this.TranlsateArrow(this.RotationArrow(originarrow, this.options.data[i + 3] + Math.PI / 2), point.x, point.y);
            newtriangle.forEach(element => {
                this.data.push(element);
            });
        }

        this.data = new Float32Array(this.data);
        // //webgl draw elements
        this.pointposition = this.gl.getAttribLocation(this.program, "position");
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pointBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.data, this.gl.STREAM_DRAW);

        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 4 * 2, 0);
        this.gl.enableVertexAttribArray(0);

        this.viewpostlocation = this.gl.getUniformLocation(this.program, "viewport");
        this.gl.uniform2f(this.viewpostlocation, this.canvas.width, this.canvas.height);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, parseInt(this.data.length / 2));

        //释放资源
        //this.gl.disable(this.gl.BLEND);
        //this.gl.deleteBuffer(this.pointBuffer);
        //this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null);
    },

    adjustSize: function () {
        var canvas = this._container;
        var canvasHeight, canvasWidth;
        canvasWidth = canvas.offsetWidth || 2;
        canvasHeight = canvas.offsetHeight || 2;
        if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
            this.gl.viewport(0, 0, canvaswidth, canvasHeight);
            this._container.width = canvasWidth;
            this._container.height = canvasHeight;

        }
    },

    initWebGL: function () {
        this.canvas = this._container;
        this.gl = this.canvas.getContext('experimental-webgl', {
            depth: false,
            antialias: true
        });

        if (this.gl == null) {
            this.gl = this.canvas.getContext('webgl', {
                depth: false,
                antialias: false
            });
        };

        function logGLCall(functionName, args) {
            console.log("gl." + functionName + "(" +
                WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
        }

        this.gl = WebGLDebugUtils.makeDebugContext(this.gl, undefined, logGLCall);

        //初始化顶点shader
        this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(this.vertexShader, this.options.vertexShaderContent);
        this.gl.compileShader(this.vertexShader);

        var compiled = this.gl.getShaderParameter(this.vertexShader, this.gl.COMPILE_STATUS);
        if (!compiled) {
            var error = this.gl.getShaderInfoLog(this.vertexShader);
        }

        //初始化片元shader
        this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(this.fragmentShader, this.options.fragmentShadercontent);
        this.gl.compileShader(this.fragmentShader);

        compiled = this.gl.getShaderParameter(this.fragmentShader, this.gl.COMPILE_STATUS);
        if (!compiled) {
            var error = this.gl.getShaderInfoLog(this.fragmentShader);
        }

        //绑定到渲染程序
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, this.vertexShader);
        this.gl.attachShader(this.program, this.fragmentShader);
        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);

        //创建缓冲区
        this.pointBuffer = this.gl.createBuffer();

        //允许传递位置数组
        this.gl.enableVertexAttribArray(0);

        //指定像素混合运算方法??
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE);

        //背景颜色
        this.gl.clearColor(0.0, 0.0, 0.0, 0.5);
    },
    GenerateArrow: function (l, w) {
        //生成箭头
        var lsin = (15 * 3 / 4.0) * Math.sin(Math.PI / 6);
        var lcos = (15 * 3 / 4.0) * Math.cos(Math.PI / 6);
        var a = [-w / 2.0, 0];
        var b = [w / 2.0, 0];
        var c = [w / 2.0, l];
        var d = [-w / 2.0, l];
        var e = [lsin, l];
        var g = [-lsin, l];
        var f = [0, l + lcos];

        var trianglefans = new Float32Array(18);
        trianglefans.set([g[0], g[1], e[0], e[1], f[0], f[1], a[0], a[1], b[0], b[1], c[0], c[1], a[0], a[1], c[0], c[1], d[0], d[1]]);
        return trianglefans;
    },
    TranlsateArrow: function (triangle, xoffset, yoffset) {
        var tt = new Float32Array(triangle);
        for (var i = 0; i < triangle.length; i++) {
            if (i % 2) tt[i] += yoffset;
            else tt[i] += xoffset;
        }
        return tt;
    },
    RotationArrow: function (triangle, rad) {
        var tt = new Float32Array(triangle);
        var cos = Math.cos(rad);
        var sin = Math.sin(rad);
        for (var i = 0; i < tt.length - 1; i += 2) {
            var a = tt[i], b = tt[i + 1];
            tt[i] = a * cos + b * sin;
            tt[i + 1] = b * cos - a * sin;
        }
        return tt;
    },
    //计算每个绘图单元的代表的长度m
    MeterOneDrawUnit:function (){
        var x = map.getSize().x, y=map.getSize().y;
        var maxmeters = map.containerPointToLatLng([0, y]).distanceTo(map.containerPointToLatLng([x, y]));
        return maxmeters / x;
    }
});

L.webGLArrow = function (options) {
    return new L.WebGLArrow(options);
}
