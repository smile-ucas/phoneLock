/**
 * Created by xiaoxiao on 2017/3/27.
 */
window.phoneLock=function (container) {
    this.container=container;
    this.height=container.offsetHeight;
    this.width=container.offsetWidth;
}

phoneLock.prototype.createBigCircle = function(x, y) { // 初始化解锁密码面板
    this.context.strokeStyle = '#fdde66';
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.arc(x, y, this.r, 0, Math.PI * 2, true);
    this.context.closePath();
    this.context.stroke();
}
phoneLock.prototype.createCircle=function (){
    var n = 3;
    var lockNum=0;
    this.r = this.canvas.width / (2*(n+n+1));//每行有n个点(此题设为3)，加上屏幕边的间隔n+1个，共设n+n+1个直径(即2*r)长

    this.aftPoint = [];
    this.remainPoint = [];
    this.arr = [];
    var r = this.r;
    for (var i = 0 ; i < n ; i++) {
        for (var j = 0 ; j < n ; j++) {
            lockNum++;
            var obj = {                //设置对象，含属性x,y与下标
                x: j * 4 * r + 3 * r,
                y: i * 4 * r + 3 * r,
                index: lockNum
            };
            this.arr.push(obj);
            this.remainPoint.push(obj);
        }
    }
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);  //canvas的2D上下文
    for (var i = 0 ; i < this.arr.length ; i++) {
        this.createBigCircle(this.arr[i].x, this.arr[i].y);  //绘制大圆
    }
}
phoneLock.prototype.getPosition=function () { //获取位置

    var temp=event.currentTarget.getBoundingClientRect();
    var position={
        x:event.touches[0].clientX-temp.left,
        y:event.touches[0].clientY-temp.top
    };
    return position;
}
phoneLock.prototype.createSmallCircle=function () {  //绘制手势出现时的大圆包含的小圆（这里设的大小圆半径一样大）
    for(var i=0;i<this.aftPoint.length;i++){
        this.context.fillStyle='#efee77';
        this.context.beginPath();
        this.context.arc(this.aftPoint[i].x,this.aftPoint[i].y,this.r,0,2*Math.PI,true);
        this.context.closePath();
        this.context.fill();
    }
}
phoneLock.prototype.createLine=function (position,aftPoint) {  //绘制手势出现时的线
    this.context.beginPath();
    this.context.lineWidth=2;
    this.context.strokeStyle = 'pink';
    this.context.moveTo(this.aftPoint[0].x,this.aftPoint[0].y);

    for(var i=1;i<this.aftPoint.length;i++){
        this.context.lineTo(this.aftPoint[i].x,this.aftPoint[i].y);
    }
    this.context.lineTo(position.x,position.y);
    this.context.stroke();
    this.context.closePath();
}
phoneLock.prototype.update=function (position) {     //更新
    this.context.clearRect(0,0,this.canvas.width,this.canvas.height);  //先清除画布
    for(var i=0;i<this.arr.length;i++){
        this.createBigCircle(this.arr[i].x,this.arr[i].y);
    }
    this.createSmallCircle(this.aftPoint);  //手势出现时绘制的在大圆中填充的小圆
    this.createLine(position,this.aftPoint);

    for(var i=0;i<this.remainPoint.length;i++){
        if(Math.abs(position.x-this.remainPoint[i].x)<this.r && Math.abs(position.y-this.remainPoint[i].y)<this.r){
            this.createSmallCircle(this.remainPoint[i].x,this.remainPoint[i].y);
            this.aftPoint.push(this.remainPoint[i]);
            this.remainPoint.splice(i,1);
            break;
        }
    }
}
phoneLock.prototype.dealPass=function (psw) { //处理对象psw，抽取出它包含的下标数字，组成数字密码
    var temp='';
    for(var i=0;i<psw.length;i++){
        temp=temp+psw[i].index;
    }
    return temp;
}
phoneLock.prototype.checkSet=function (first,second) {  //检查两个手势密码是否相等
    var ans=true;
    if(first.length!=second.length){  //先检查长度是否一样长
        ans=false;
    }
    else{
        for(var i=0;i<second.length;i++){  //若长度一样长，再检查内容
            if(second[i].index!=first[i]){
                ans=false;
                break;
            }
        }
    }
    if(ans==true){
        this.password=first;
        window.localStorage.setItem("password",first);  //更新localStorage对象
        console.log('当前保存的密码是:'+window.localStorage.getItem("password"));
    }
    return ans;
}
phoneLock.prototype.reset=function () {//重置
    this.createCircle();
}
phoneLock.prototype.verMinLengthP=function (point) {
    var temp=this.dealPass(point);
    if(temp.length<5){
        return false;
    }
    return true;
}
phoneLock.prototype.bindEvent=function (){ //绑定事件
    var f_this=this;
    this.setP.addEventListener("click",function () {  //设置密码时的事件
        document.getElementById("info").innerHTML="请输入手势密码";
        f_this.verFlag=false;
        f_this.radioSetP=true;
        f_this.radioVerP=false;
    },false);
    this.verP.addEventListener("click",function () {   //验证密码时的事件
        document.getElementById("info").innerHTML="请验证密码";
        f_this.verFlag=true;
        f_this.radioSetP=false;
        f_this.radioVerP=true;
    },false);

    this.canvas.addEventListener("touchstart",function(event){  //手势开始

        event.preventDefault();
        var position=f_this.getPosition(event);
        for(var i=0;i<f_this.arr.length;i++){
            if(Math.abs(position.x-f_this.arr[i].x)<f_this.r && Math.abs(position.y-f_this.arr[i].y)<f_this.r){
                f_this.touchFlag=true;
                f_this.createSmallCircle(f_this.arr[i].x,f_this.arr[i].y);
                f_this.aftPoint.push(f_this.arr[i]);
                f_this.remainPoint.splice(i,1);

                break;
            }
        }
    },false);

    this.canvas.addEventListener("touchmove",function (event) { //手势进行中
        if(f_this.touchFlag){
            f_this.update(f_this.getPosition(event));
        }
    },false);
    this.canvas.addEventListener("touchend",function (event) {  //手势结束
        if(f_this.touchFlag){

            f_this.touchFlag=false;

            //在这里验证这个密码是否符合题意，验证密码长度不能少于3，如果不合格，就重置aftPoint数组
            if(!f_this.verMinLengthP(f_this.aftPoint)){
                document.getElementById("info").innerHTML="密码太短，不能少于5个点";
                f_this.aftPoint=[];
            }


            //以下为处理，同时更新显示信息的label（id为"info"）内容

            if(f_this.verFlag==false && f_this.radioSetP==true && f_this.aftPoint.length!=0){
                // debugger
                if(f_this.setNum==0){
                    f_this.setNum=parseInt(f_this.setNum)+1;
                    f_this.firstPassword=f_this.dealPass(f_this.aftPoint);
                    document.getElementById("info").innerHTML="请再次输入手势密码";
                }
                else if(f_this.setNum==1){

                    var ans=f_this.checkSet(f_this.firstPassword,f_this.aftPoint);
                    if(ans==false){
                        document.getElementById("info").innerHTML="两次输入的不一致";
                    }
                    else {
                        document.getElementById("info").innerHTML="密码设置成功";
                    }
                    f_this.setNum=parseInt(0);
                }
            }
            else if(f_this.verFlag==true && f_this.radioVerP==true && f_this.aftPoint.length!=0){
                // debugger
                var tempLocalStorage,ans;
                tempLocalStorage=window.localStorage.getItem("password");
                if(tempLocalStorage==null){
                    document.getElementById("info").innerHTML="还没有密码，请设置密码";
                    document.getElementById("setP").checked=true;
                    f_this.verFlag=false;
                    f_this.radioSetP=true;
                    f_this.radioVerP=false;
                    setTimeout(function () {
                        f_this.reset();
                    },2000);
                    document.getElementById("info").innerHTML="请输入手势密码";
                }
                else{
                    ans=f_this.checkSet(tempLocalStorage,f_this.aftPoint);
                    if(ans==false){
                        document.getElementById("info").innerHTML="输入的密码不正确";
                    }
                    else {
                        document.getElementById("info").innerHTML="密码正确！";
                        setTimeout(function () {
                            document.getElementById("info").innerHTML="请验证密码";
                        },1000);
                    }
                    ans="";
                }


            }

            setTimeout(function () {
                f_this.reset();
            },200);
        }
    },false);

}

phoneLock.prototype.init=function () {
    //为组件添加各种所需控件
    var subContainer='<div style="position:absolute;left:0px;right:0px;bottom: 0px;top:0px;background-color: indianred;filter:blur(25px);height: '+this.height+';width:'+this.width+';"></div>'
        +'<div style="position:relative;height:'+this.width+'px;width:'+this.width+'px;top: 10%;left:50%;transform: translateX(-50%);z-index: 999;">'
        +'<canvas id="canvas" height='+this.width+' width='+this.width+' >目前的浏览器不支持canvas，请尝试着换一个浏览器</canvas>'
        +'</div>'
        +'<div style="position:relative;width:'+this.width+'px;top:10%;left:50%;transform: translateX(-50%);text-align: center;font-size: 20px;">'
        +'<label id="info">请验证密码</label>'
        +'</div>'
        +'<div style="position:relative;width:'+this.width+'px;top:15%;left:50%;transform: translateX(-50%);text-align: center;font-size: 20px;letter-spacing:20px">'
        +'<input type="radio" id="setP" name="pL" /><label for="setP">设置密码</label>'
        +'</div>'
        +'<div style="position:relative;width:'+this.width+'px;top:18%;left:50%;transform: translateX(-50%);text-align: center;font-size: 20px;letter-spacing:20px">'
        +'<input type="radio" id="verP" name="pL" checked/><label for="verP">验证密码</label>'
        +'</div>';
    this.container.innerHTML=subContainer;

    //控制台提示信息
    console.log('当前保存的密码是:'+window.localStorage.getItem("password"));

    //属性
    this.aftPoint = [];
    this.password = [];
    this.firstPassword=[];
    this.touchFlag = false;
    this.setNum=0;
    this.verFlag=true;
    this.radioSetP=false;
    this.radioVerP=true;
    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');
    this.createCircle();
    this.setP=document.getElementById('setP');
    this.verP=document.getElementById('verP');

    this.bindEvent();//绑定事件
}

