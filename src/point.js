/**
 * Created by Administrator on 14-7-26.
 */
Point = cc.Sprite.extend({
    selected:false,
    indexX:null,
    indexY:null,
    marginTop:-1,
    marginleft:3,
    chessboardPaddingLeft:35,
    ctor:function(indexX,indexY,selected){

        this._super(selected?res.pot2_png:res.pot1_png);
        this.selected = selected;
        this.indexX = indexX;
        this.indexY = indexY;
        var size = cc.director.getWinSize();
        this.y = size.height/2 + 20 - (this.marginTop + this.height) * indexY;
        this.x = this.chessboardPaddingLeft + (this.marginleft + this.width) * indexX;
        if(indexY%2 == 1){
            this.x += this.width/2;
        }

    },
    select:function(){
        this.setTexture(res.pot2_png);
        this.selected = true;
    }
});

Point.create = function(indexX,indexY,selected){
    return new Point(indexX,indexY,selected);
}