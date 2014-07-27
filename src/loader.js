Loader = cc.Scene.extend({
    _interval : null,
    _length : 0,
    _count : 0,
    _label : null,
    _className:"LoaderScene",
    _rate:8,
    init : function(){
        var self = this;

        // bg
        var bgLayer = self._bgLayer = cc.LayerColor.create(cc.color(32, 32, 32, 255));
        bgLayer.setPosition(cc.visibleRect.bottomLeft);
        self.addChild(bgLayer, 0);

        //image move to CCSceneFile.js
        var fontSize = 24;
        //loading percent
        var label = self._label = cc.LabelTTF.create("Loading... 0%", "Arial", fontSize);
        label.setPosition(cc.visibleRect.center);
        label.setColor(cc.color(180, 180, 180));
        bgLayer.addChild(this._label, 10);


        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesMoved:function (touches, event) {
                var self = event.getCurrentTarget();
                self._label.stopAllActions();

                var event = touches[0];
                self._rate = 1;

                self._label.setPosition(event.getLocation());
            },
            onTouchesEnded:function(touches, event){
                var self = event.getCurrentTarget();
                self._label.stopAllActions();

                self._rate = 8;

                self._label.runAction(cc.Sequence.create(cc.MoveTo.create(1,cc.visibleRect.center)));
            }
        }, this);

        return true;
    },

    onEnter: function () {
        var self = this;
        cc.Node.prototype.onEnter.call(self);
        self.schedule(self._startLoading, 0.3);
    },

    onExit: function () {
        cc.Node.prototype.onExit.call(this);
        var tmpStr = "Loading... 0%";
        this._label.setString(tmpStr);
    },

    /**
     * init with resources
     * @param {Array} resources
     * @param {Function|String} cb
     */
    initWithResources: function (resources, cb) {
        if(typeof resources == "string") resources = [resources];
        this.resources = resources || [];
        this.cb = cb;
    },

    _startLoading: function () {
        var self = this;
        self.unschedule(self._startLoading);
        var res = self.resources;
        
        if (config.loadingPageDebug) {
            self._length = config.loadingLength;
            self.schedule(function(){
                self._count++;
                if (self._count>=self._length&&self.cb) {
                    //self.cb();
                };
            },1);
        }else{
            self._length = res.length;
            cc.loader.load(res,
                function(result, count){
                    if (config.loadingPageDebug) {
                        self._count++; 
                    }else
                        self._count = count; 
                }, 
                function(){
                     if(self.cb)
                         self.cb();
                }
            );
        }

        self.schedule(self._updatePercent);
    },

    _updatePercent: function () {
        var self = this;
        var count = self._count;
        var length = self._length;
        var percent = (count / length * 100) | 0;
        percent = Math.min(percent, 100);
        self._label.setString("YiLoading... " + percent + "%");
        var rotation = self._label.getRotation()+self._rate;
        self._label.setRotation(rotation>360?0:rotation);
        if(count >= length) self.unschedule(self._updatePercent);
    }
});
Loader.preload = function(resources, cb){
    var _cc = cc;
    var _Loader = new Loader();
        _Loader.init();
    
    _Loader.initWithResources(resources, cb);

    cc.director.runScene(_Loader);
    return _Loader;
};