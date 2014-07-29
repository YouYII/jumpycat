DIFFICULTLY = 0.2;
showWelcome = true;
var Game =  cc.Layer.extend({
    jumpycat:null,
    _texOpaqueBatch:null,
    chessboardData:null,
    points:null,
    welcome:null,
    lock:true,
    moveCount:null,
    init:function(){
        this._super();
        var frameCache = cc.spriteFrameCache;
        frameCache.addSpriteFrames(res.jumpycat_plist);
        var jumpcat_cache = cc.textureCache.addImage(res.jumpycat_png);
        this._texOpaqueBatch = cc.SpriteBatchNode.create(jumpcat_cache);
        this._texOpaqueBatch.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        this.addChild(this._texOpaqueBatch);

        var size = cc.director.getWinSize();

        //set bg
        var bg = cc.Sprite.create(res.bg_jpg);
        bg.scale = size.width/bg.width;
        bg.x = size.width - bg.scale*bg.width/2;
        bg.y = size.height - bg.scale*bg.height/2;

        this.addChild(bg);

        //restart
//        var restart = cc.MenuItemFont.create('restart',function(){
//            cc.director.runScene(Game.scene());
//        },this);
        cc.MenuItemFont.setFontSize(20);
        var exit = cc.MenuItemFont.create('退出',function(){
        	cc.director.end();
        },this);
        exit.setColor(cc.color('#333333'));
        var menu = cc.Menu.create(exit);
        menu.x = size.width - 40;
        menu.y = size.height - 40;
        this.addChild(menu,1000);
        //welcome page

        var welcome  = cc.MenuItemImage.create(res.btn_start_png,res.btn_start_png,res.btn_start_png,this.startGame,this);

        this.welcome = cc.Menu.create(welcome);
        this.welcome.x = size.width /2;
        this.welcome.y = size.height/2;
        this.addChild(this.welcome,1100);
        this.renderChessboard();
        if(!showWelcome){
            this.startGame();
        }else{
            showWelcome = false;
        }

        //event listen
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesEnded:this.clickPoint
        },this);

        
        return true;
    },
    renderChessboard:function(){
        //9x9
        var point,selected;
        this.chessboardData = [];
        for(var indexX= 0;indexX<9;indexX++){
            var data = [];
            for(var indexY=0;indexY<9;indexY++){
                //render view
                if(indexX ==4 && indexY ==4){
                    selected = false;
                }else
                    selected = Math.random()<DIFFICULTLY;
                point = Point.create(indexX,indexY,selected);
                data.push(point);
                this.addChild(point);
            }
            this.chessboardData.push(data);
        }
    },
    startGame:function(){
        this.welcome.removeFromParent();
        this.lock = false;
        this.moveCount = 0;
        if(this.jumpycat){
            this.jumpycat.removeFromParent(true);
        }
        var jumpycat = this.jumpycat = cc.Sprite.create('#stay3.png');
        this.catMoveTo(4,4);
        this.addChild(jumpycat,1000);
        var frameCache = cc.spriteFrameCache;
        var animation1 = cc.Animation.create();
        animation1.addSpriteFrame(frameCache.getSpriteFrame('stay3.png'));
        animation1.addSpriteFrame(frameCache.getSpriteFrame('stay1.png'));
        animation1.addSpriteFrame(frameCache.getSpriteFrame('stay3.png'));
        animation1.addSpriteFrame(frameCache.getSpriteFrame('stay2.png'));
        animation1.setDelayPerUnit(2.8 / 14);
        animation1.setRestoreOriginalFrame(true);
        var actionAnimate = cc.Animate.create(animation1).repeatForever();
        jumpycat.runAction(actionAnimate);
    },
    catMoveTo:function(indexX,indexY){
        if(this.jumpycat){
            var jumpycat = this.jumpycat;
            var point = this.chessboardData[indexX][indexY];
            jumpycat.x = point.x;
            jumpycat.y = point.y + point.height - 5;
            jumpycat.indexX = indexX;
            jumpycat.indexY = indexY;
        }

    },
    clickPoint:function(touches,event){
        var self = event.getCurrentTarget();
        
        if(self.lock){
        	return;
        }
        var touch = touches[0];
        var location = touch.getLocation();

        var data = self.chessboardData;
        var point;

        for(var indexX in data){
            for(var indexY in data[indexX]){
                point = data[indexX][indexY];
                if(!point.selected && cc.rectContainsPoint(point.getBoundingBox(),location)){
                    point.select();
                    self.autoMoveCat();
                    return;
                }
            }
        }
    },
    autoMoveCat:function(){
        this.moveCount++;
        var cat = this.jumpycat;
        var optimumLenth = 10000;
        var lengthTmp;
        var optimumWay = false;
        //  0      1     2     3    4      5
        //左上    右上  右   右下   左下  左
        for(var i=0;i<6;i++){
            lengthTmp = this.getWayLength(i);
            if(lengthTmp === 0 ){
            	this.showLoseOut();
            	return;
            }else if(lengthTmp === false){
                continue;
            }else if(lengthTmp<optimumLenth){
                optimumWay = i;
                lengthTmp = optimumLenth;
            }
        }
        if(optimumWay === false){
            var frameCache = cc.spriteFrameCache;
            var animation2 = cc.Animation.create();
            animation2.addSpriteFrame(frameCache.getSpriteFrame('weizhu1.png'));
            animation2.addSpriteFrame(frameCache.getSpriteFrame('weizhu2.png'));
            animation2.addSpriteFrame(frameCache.getSpriteFrame('weizhu3.png'));
            animation2.addSpriteFrame(frameCache.getSpriteFrame('weizhu4.png'));
            animation2.addSpriteFrame(frameCache.getSpriteFrame('weizhu5.png'));
            animation2.setDelayPerUnit(2.8 / 14);
            animation2.setRestoreOriginalFrame(true);
            var actionAnimate2 = cc.Animate.create(animation2).repeatForever();
            cat.stopAllActions();
            cat.runAction(actionAnimate2);
            //random move
            for(var j=0;j<6;j++){
                var p = this.getNextPointByWay(cat.indexX,cat.indexY,j);
                if(typeof(p) == 'object'&& !p.selected){
                    this.catMoveTo(p.indexX,p.indexY);
                    return;
                }
            }
            this.showWin();
        }else{
            var point = this.getNextPointByWay(cat.indexX,cat.indexY,optimumWay);
            if(point === true){
                this.showLoseOut();
            }else
                this.catMoveTo(point.indexX,point.indexY);
        }

    },
    getWayLength:function(way){
        var cat = this.jumpycat;
        var x = cat.indexX,y = cat.indexY;
        var length = 0;
        var point;
        while(true){
            point = this.getNextPointByWay(x,y,way);
            if(point === true){
                break;
            }else if(point === false){
                length = false;
                break;
            }else{
                length++;
                x = point.indexX;
                y = point.indexY;
            }
        }
        return length;
    },
    getNextPointByWay:function(x,y,way){
        var isOddY = y%2 == 1;
        switch (way){
            case 0:
                if(!isOddY){
                    x --;
                }
                y ++;
                break;
            case 1:
                if(isOddY){
                    x ++;
                }
                y ++;
                break;
            case 2:
                x ++;
                break;
            case 3:
                x --;
                break;
            case 4:
                if(!isOddY){
                    x --;
                }
                y --;
                break;
            case 5:
                if(isOddY){
                    x ++;
                }
                y --;
                break;
            default:
                throw new Error('Not defined way' + way);
        }
        if(x<0||x>8||y<0||y>8){
            return true;
        }else if(this.chessboardData[x][y].selected == true){
            return false;
        }else{
            return this.chessboardData[x][y];
        }

    },
    showWin:function(){
        this.lock = true;
        var size = cc.director.getWinSize();
        var win = cc.Sprite.create(res.victory_png);
        win.x = size.width/2;
        win.y = size.height/2 + 100;
        this.addChild(win,1200);
        this.showShareAndRestart();
        var message;
        if(this.moveCount<10){
        	message = message1[this.moveCount]?message1[this.moveCount]:message0;
        }else{
        	message = mess(message2).pop();
        }
        var label1 = cc.LabelTTF.create(message,"Arial",32);
        label1.setFontFillColor(cc.color('#333333'));
        label1.x = size.width/2;
        label1.y = size.height/2 + 30;
        this.addChild(label1,2000);

        var label2 = cc.LabelTTF.create("你用了"+this.moveCount+"步抓住了神经猫,获得称号:","Arial",20);
        label2.setFontFillColor(cc.color('#333333'));
        label2.x = size.width/2 - 40;
        label2.y = size.height/2 + 80;

        this.addChild(label2,2000);
    },
    showLoseOut:function(){
        this.lock = true;
        var size = cc.director.getWinSize();
        var failed = cc.Sprite.create(res.failed_png);
        failed.x = size.width/2;
        failed.y = size.height/2 + 100;
        this.addChild(failed,1200);
        this.showShareAndRestart();

        var label1 = cc.LabelTTF.create("院长已经发疯了!","Arial",32);
        label1.setFontFillColor(cc.color('#333333'));
        label1.x = size.width/2;
        label1.y = size.height/2 + 30;
        this.addChild(label1,2000);

        var label2 = cc.LabelTTF.create("神经猫成功逃跑","Arial",20);
        label2.setFontFillColor(cc.color('#333333'));
        label2.x = size.width/2 - 40;
        label2.y = size.height/2 + 80;

        this.addChild(label2,2000);
    },
    showShareAndRestart:function(){
        var size = cc.director.getWinSize();
        var share = cc.MenuItemImage.create(res.shareBTN_png,res.shareBTN_png,res.shareBTN_png,function(){

        },this);
        var restart = cc.MenuItemImage.create(res.replay_png,res.replay_png,res.replay_png,function(){
            cc.director.runScene(Game.scene());
        },this);
        var menu = cc.Menu.create(share,restart);
        //var menu = cc.Menu.create(restart);
        menu.alignItemsHorizontallyWithPadding(10);
        menu.x = size.width/2;
        menu.y = size.height/2 - 140;
        this.addChild(menu,1300);

    }

});


function mess(arr){ 
	arr = arr.slice(0);
	var _floor = Math.floor, _random = Math.random, 
	len = arr.length, i, j, arri, 
	n = _floor(len/2)+1; 
	while( n-- ){ 
		i = _floor(_random()*len); 
		j = _floor(_random()*len); 
		if( i!==j ){ 
			arri = arr[i]; 
			arr[i] = arr[j]; 
			arr[j] = arri; 
		} 
	} 
	
	i = _floor(_random()*len); 
	arr.push.apply(arr, arr.splice(0,i)); 
	return arr; 
} 
Game.scene = function(){
    var scene = cc.Scene.create();
    var game = Game.create();
    scene.addChild(game);
    return scene;
}

Game.create = function(){
    var gameLayer = new Game();
    if(gameLayer && gameLayer.init()){
        return gameLayer;
    }
    return null;
}
var message0 = "你就是神经猫";
var message1 = [
               "黑猫警长",
               "神经猫的主人",
               "和神经猫一样神经的人",
               "神经猫的好朋友",
               "比神经猫更神经的人",
               "懂神经猫的人",
               "神经猫的孪生兄弟",
               "神经猫的贴心妹子",
               "神经猫的亲哥"
];
var message2 = [
                "神经猫的大侄子",
                "神经猫的远房亲戚",
                "神经猫的大表哥",
                "神经猫的闺蜜",
                "神经猫的亲戚"
                ];
