cc.game.onStart = function(){
	if(cc.sys.isNative)
		cc.view.setDesignResolutionSize(480, 960, cc.ResolutionPolicy.FIXED_WIDTH);
	else 
		cc.view.setDesignResolutionSize(480, 800, cc.ResolutionPolicy.SHOW_ALL);
	
	cc.view.resizeWithBrowserSize(true);
    //load resources
    cc.LoaderScene.preload(g_resources, function () {
        cc.director.runScene(Game.scene());
    }, this);
};
cc.game.run();