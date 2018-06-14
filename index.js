function Vector(a,b){
	return {
		x:b.x-a.x,
		y:b.y-a.y
	}
}
function vectorProduct(v1,v2){
	return v1.x*v2.y - v2.x*v1.y;
}
function isInTriangle(p,a,b,c){
	var pa = Vector(p,a)
	var pb = Vector(p,b)
	var pc = Vector(p,c)
	var t1 =  vectorProduct(pa,pb)
	var t2 =  vectorProduct(pb,pc)
	var t3 =  vectorProduct(pc,pa)
	return sameSign(t1,t2)&&sameSign(t2,t3)&&sameSign(t1,t3)
}
function sameSign(a,b){
	return (a^b)>=0
}
//是否需要延时：原理是判断鼠标当前点是否在上一个点和二级菜单左上和左下角构成的三角形内
function needDelay(elem,leftCorner,currentPos){
	var offset = elem.offset()
	var topLeft = {
		x:offset.left,
		y:offset.top
	}
	var bottomLeft = {
		x:offset.left,
		y:offset.top+elem.height()
	}
	return isInTriangle(currentPos,leftCorner,topLeft,bottomLeft)
}
$(document).ready(function(){
	var sub = $('#sub')
	var firstMenu = $('#test')
	//激活的二级菜单
	var activeMenu;
	//当前激活的一级菜单
	var activeRow;
	var timerId = null;
	//鼠标是否在二级菜单内
	var mouseInSub = false;
	var mouseTrack = [];
	//记录鼠标轨迹点
	var mouseMoveHandler = function(e){
		//只记录3个点
		mouseTrack.push({
			x:e.pageX,
			y:e.pageY
		})
		if(mouseTrack.length>3){
			mouseTrack.shift();
		}
	}

	sub.on('mouseenter',function(){
		mouseInSub = true;
	}).on('mouseleave',function(){
		mouseInSub = false;
	});

	firstMenu.on('mouseenter',function(e){
		sub.removeClass('hide')
		$(document).bind('mousemove',mouseMoveHandler)

	}).on('mouseleave',function(e){
		sub.addClass('hide')
		$(document).unbind('mousemove',mouseMoveHandler)
		if(activeRow){
			activeRow.removeClass('active')
			activeRow=null;
		}
		if(activeMenu){
			activeMenu.addClass('hide')
			activeMenu=null;
		}
	//这里采用事件代理技术
	}).on('mouseenter','li',function(e){
		if(!activeRow){
			activeRow = $(e.target).addClass('active')
			activeMenu = $('#'+activeRow.data('id'))
			activeMenu.removeClass('hide')
			return
		}
		//防抖操作，快速在一级菜单内移动只计算最后一次
		if(timerId)clearTimeout(timerId)
		var currentMousePosition = mouseTrack[mouseTrack.length-1];
		var leftCorner = mouseTrack[mouseTrack.length-2];
		//是否需要延时，如果用户直接在一级菜单中上下滑动则取消延迟
		//向量法判断点是否在三角形内
		var delay = needDelay(sub,leftCorner,currentMousePosition);
		if(delay){
			//延迟300ms
			timerId = setTimeout(function(){
				if(mouseInSub)return;
				//隐藏上一个li
				activeRow&&activeRow.removeClass('active')
				activeMenu&&activeMenu.addClass('hide')
				//显示当前一级菜单以及对应的二级菜单
				activeRow = $(e.target)
				activeRow.addClass('active')
				activeMenu = $('#'+activeRow.data('id'));
				activeMenu.removeClass('hide')
				timerId=null;
			},300);
		}else{
			//隐藏上一个li
			activeRow.removeClass('active')
			activeMenu.addClass('hide')
			//显示当前li
			activeRow = $(e.target)
			activeRow.addClass('active')
			activeMenu = $('#'+activeRow.data('id'));
			activeMenu.removeClass('hide')
		}
	})
})