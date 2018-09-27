$(function () {
//错误提示弹窗
	$('#error').dialog({
		autoOpen : false,
		modal : true,
		closeOnEscape : false,
		resizable : false,
		draggable : false,
		width : 180,
		height : 50,
	}).parent().find('.ui-widget-header').hide();

//加载中提示弹窗	
	$('#loading').dialog({
		autoOpen : false,
		modal : true,
		closeOnEscape : false,
		resizable : false,
		draggable : false,
		width : 180,
		height : 50,
	}).parent().find('.ui-widget-header').hide();
	
//main中tabs	
	$('#tabs').tabs();

//main中右侧手风琴		
	$('#accordion').accordion({
		header : 'h3',
	});

//header里查询按钮
	$('#search_button').button({
		icons : {
			primary : 'ui-icon-search',
		}
	}).click(function () {
		alert("提问")
	});

//header里input框
	$(".search").click(function(){
		$(this).val('');
		$(".search_content").show();
	}).keyup(function(){
		var val= $(this).val().toLowerCase();
		val=val.replace(/\s+/g,'');
		var searchedArr=searchArtical(dataArr,val);
		appendItems(searchedArr,$(".search_content"));
	}).mouseover(function(){
		$(".search_content").show();
	}).mouseleave(function(){
		$(".search_content").hide();
	});
	$(".search_content").mouseover(function(){
		$(".search_content").show();
	}).mouseleave(function(){
		$(".search_content").hide();
	});
//文章提示点击后详情页
	$(".search_content").on('click','.searched_title',function(){
		$(".search_content").hide();
		var html='';
		var commentArr=[];
		for (var i = 0; i < dataArr.length; i++) {
			if (dataArr[i].title==$(this).text()) {
				commentArr=dataArr[i].comment;					 
				html="<div class=''><h3><span class=''>作者："+dataArr[i]['author']+"</span><span class='searched_title'>标题："+dataArr[i].title+"</span></h3><div class=''>正文："+dataArr[i].content+"</div><div class='searched_comment'>"+"评论区"+"</div></div>";					
			}			
		};
		$(".searched_artical").html(html);
		$(".to_searched").dialog({
			modal:true,
			width:800,
			buttons:[
				{
					text:'展开评论',
					click:function(){
						var html='';
						$(".searched_comment").show();
						for (var i = 0; i < commentArr.length; i++) {
							html+="<p><span>用户："+commentArr[i].user+"</span><span>评论："+commentArr[i].words+"</span></p>"
						};
						$(".searched_comment").html(html);
						$(".ui-button-text").text('已显示评论')
					}
				}
			]
		});
	});

//封装搜索关键字函数
	var searchedResult=[];
	function searchArtical(database,keywords){
		searchedResult=[];//每次重新搜索别的关键字时都清空已经添加进去的数据，换成新的搜索结果
		for (var i = 0; i < database.length; i++) {
			for (var j = 0; j < keywords.length; j++) {
				//已经添加进搜索结果的标题不要重复添加
				if (database[i].title.toLowerCase().indexOf(keywords[j])>-1 && !searchedResult.contain(database[i].title)) {
					searchedResult.push(database[i].title) 
				}
			};
		};
		return searchedResult;
	};

// 给Array添加一个方法，用于查找是否包含某元素
	Array.prototype.contain=function(value){
		var isContain=false;
		for (var i = 0; i < this.length; i++) {
			if(this[i]==value){
				isContain= true;
			}
		};
		return isContain;
	}

//封装用搜索结果组装文章提示框search_content函数
	function appendItems(data,element){
		var html='';
		for (var i = 0; i < data.length; i++) {
			html+="<p class='searched_title'>"+data[i]+"</p>";
		};
		element.html('');//每次组装时先清空dom，再渲染，防止重复渲染已有dom
		element.append(html);
	}


//深拷贝函数，复制存储ajax获取的信息
	function deepCopy(data){
		var arr=[];
		for(i in data){
			if (data[i] instanceof Object) {
				arr[i]= deepCopy(data[i]);//切记，不要忘记用arr[i]保存递归的返回
			} else{
				arr[i]=data[i]
			};
		}	
		return arr;	
	};


//封装渲染DOM函数，深拷贝json数据,每次只渲染3条
	var dataArr=[], dataStart=0, dataCount=3,dataStop=dataStart+dataCount;
	var appendJson=function(data,dataStart,dataStop){
		//只是第一次ajax需要深拷贝，保存数据后不需要
		if (dataArr.length===0) {
			dataArr=deepCopy(data);//存储ajax获取的信息
			// dataArr=data;浅拷贝，引用
		}
		//如果已经渲染完所有数据，开始点就是数据长度，就不再渲染
		if (dataStart>=data.length) {
			$("#loading").text('已无更多数据!').dialog('open');
			setTimeout(function(){
				$("#loading").text('数据交互中...').dialog('close');					
			},500)
		}else{
			var html=''
			dataArr.slice(dataStart,dataStop).forEach(function(value,index){
				var content=value.content.substring(0,100)+'......';
				html="<div class='main_question_item'><h3><span class='main_question_item_author'>作者："+value.author+"</span><span class='main_question_item_title'>标题："+value.title+"</span></h3>"+"<div class='main_question_item_content'>正文："+content+"</div><div class='main_question_item_show'><span class='main_question_item_id'>"+value.id+"</span><span class='main_question_item_showUp'>展示全部</span><span class='main_question_item_show_comment'>查看评论</span></div><div class='comment'></div><hr/></div>";
				$(".main_question").append(html);
			});				
		}
	};

//封装获取data方法
	var getData=function(url){
		$.ajax({
			url:url,
			type:'GET',
			success:function(res){
				appendJson(res,dataStart,dataStop);//渲染DOM,3条
			},
			error:function(res){
				console.log('请求错误'+res);
			}
		});		
	};


//首页加载就获取一次文章数据
	getData('./data/artical.json');

//加载更多问题按钮
	$(".main_question_showmore").click(function(){
		dataStart=dataStop;//更新渲染开始和结束点
		dataStop=dataStart+dataCount;
		appendJson(dataArr,dataStart,dataStop);
	});

//收起展开全文区域，append的元素需要父级事件监听

	$(".main_question").on('click','.main_question_item_showUp',function(){
		var dataIndex=$(this).siblings('.main_question_item_id').text();//获取文章编号
		if ($(this).text()=='展示全部') {		
			$(this).parent().siblings('.main_question_item_content').text(dataArr[dataIndex].content);
			$(this).text('收起');
		} else{
			$(this).parent().siblings('.main_question_item_content').text(dataArr[dataIndex].content.substring(0,100)+'......');
			$(this).text('展示全部');
		};

	});		

//评论区域
	var appendedArr=[];//保存每个文章评论append状态，已经渲染过的dom不需再次渲染
	$(".main_question").on('click','.main_question_item_show_comment',function(){
		var dataIndex=$(this).siblings('.main_question_item_id').text();//获取文章编号
		var text=$(this).text();
		var html='';
		var comment=dataArr[dataIndex].comment;
		if (comment.length>0&&!appendedArr[dataIndex]) {
			for (var i = 0; i < comment.length; i++) {
				html+="<p><span class='comment_user'>用户："+comment[i].user+"</span><p class='comment_words'>评论："+comment[i].words+"</p></p><hr/>";
			};
			$(this).parent().siblings(".comment").append(html);
			appendedArr[dataIndex]=true;//更新数组状态
		} else if(comment.length>0&&appendedArr[dataIndex]===true){
			//nothing to do
		}else{
			$(this).parent().siblings(".comment").html('木有评论');
		};
		if (text=='查看评论') {
			$(this).parent().siblings(".comment").show();
			$(this).text('收起评论')
		} else{
			$(this).parent().siblings(".comment").hide();
			$(this).text('查看评论')
		};
		
	});	

//回到顶部按钮
	$(".to_top").click(function () {
        var speed=200;//滑动的速度
        $('body,html').animate({ scrollTop: 0 }, speed);
        return false;
 });

//旋转木马
$(".slider").slick({
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2000,
})


});


























