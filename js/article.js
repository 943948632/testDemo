(function($) {
				$.getUrlParam = function(name) {
					var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
					var r = window.location.search.substr(1).match(reg);
					if(r != null) return unescape(r[2]);
					return null;
				}
				$.extend({
			        myTime: {
			            /**
			             * 当前时间戳
			             * @return <int>        unix时间戳(秒)  
			             */
			            CurTime: function(){
			                return Date.parse(new Date())/1000;
			            },
			            /**              
			             * 日期 转换为 Unix时间戳
			             * @param <string> 2014-01-01 20:20:20  日期格式              
			             * @return <int>        unix时间戳(秒)              
			             */
			            DateToUnix: function(string) {
			                var f = string.split(' ', 2);
			                var d = (f[0] ? f[0] : '').split('-', 3);
			                var t = (f[1] ? f[1] : '').split(':', 3);
			                return (new Date(
			                        parseInt(d[0], 10) || null,
			                        (parseInt(d[1], 10) || 1) - 1,
			                        parseInt(d[2], 10) || null,
			                        parseInt(t[0], 10) || null,
			                        parseInt(t[1], 10) || null,
			                        parseInt(t[2], 10) || null
			                        )).getTime() / 1000;
			            },
			            /**              
			             * 时间戳转换日期              
			             * @param <int> unixTime    待时间戳(秒)              
			             * @param <bool> isFull    返回完整时间(Y-m-d 或者 Y-m-d H:i:s)              
			             * @param <int>  timeZone   时区              
			             */
			            UnixToDate: function(unixTime, isFull, timeZone) {
			                if (typeof (timeZone) == 'number')
			                {
			                    unixTime = parseInt(unixTime) + parseInt(timeZone) * 60 * 60;
			                }
			                var time = new Date(unixTime);
			                var ymdhis = "";
			                ymdhis += time.getUTCFullYear() + "-";
			                ymdhis += (time.getUTCMonth()+1) + "-";
			                ymdhis += time.getUTCDate();
			                if (isFull === true)
			                {
			                    ymdhis += " " + time.getUTCHours() + ":";
			                    ymdhis += time.getUTCMinutes() + ":";
			                    ymdhis += time.getUTCSeconds();
			                }
			                return ymdhis;
			            }
			        }

				});
			})(jQuery);


			$(function() {

				var xx =$.getUrlParam('articleId');
				var token = jsObj.htmlGetToken();
				//'f6776f764efb0a342a655c233082884d'
				//
				var pageSize = 5;
				var orderParm = "createDate";
				var x = 1; //设置当前页数
				var flag = true;
				var switchs = true;
				var totalpage = 10; //总页数，防止超过总页数继续滚动
			    var winH = $(window).height(); //页面可视区域高度
			    var obj = null;
			    var reviewid = 0;
			    var replyid=0;
			    var replyname = null;
			   	var memberid = 0;//文章作者id
			   	var memberIds = 0;//和app交互的id
			   	var favoriteval = 0;
			   	var zanval =0;
			   	var $zan = $('.zan');
			    $(window).scroll(function() {
			        if (x <= totalpage) { // 当滚动的页数小于总页数的时候，继续加载
			             var pageH = $(document.body).height();
			             var scrollT = $(window).scrollTop(); //滚动条top 
			             var aa = (pageH - winH - scrollT) / winH;
			              if (aa < 0.01) {
			                   getJson(x);
			              }
			         } else { //否则显示无数据
			        	 $(".bottom").show().html("已经全部加载完毕");
			         }
			     });
			    
					$.ajax({
							url: "http://192.168.1.199:8090/shopxx/mobile/member/article/detail.jhtml",
							type: "GET",
							dataType: "json",
							async : true,
							data: {
								articleId: xx,
								pageNumber: x,
								pageSize: pageSize,
								type: orderParm,
								token:token
							},
							success: function(json) {
								console.log(json);
								memberid = json.data.member_id;
								memberIds = json.data.member_id;
								if(json.result == '1') {
									
									$("#tittle").text(json.data.title);
									$("#username").find('p').eq(0).html(json.data.member_username);
									//赞
									if(json.data.isLike==0){
										$zan.attr('iszan','0');
										$zan.css('background','url(../../resources/shop/mobile/images/zan1.png) no-repeat');
										$zan.css('background-size','cover');
									}else{
										$zan.attr('iszan','1');
										$zan.css('background','url(../../resources/shop/mobile/images/zan2.png) no-repeat');
										$zan.css('background-size','cover');
									}
									zanval = json.data.isLike; 
									$("#down h4").text(''+zanval+' 赞');
									//关注
									if(json.data.isAttention==0){
										$(".focus").html("关注").css('background','#f4c400');
									}else if(json.data.isAttention==1){
										$(".focus").html("已关注").css('background','#d2d2d2');
									}
									
									//点击文章作者头像跳转app
									$("#titpic").click(function(){
										//alert(memberIds)
										jsObj.getMemberId(memberIds);
									});
									$("#titpic").attr("src", json.data.member_headUrl);
									$("#head").show();
									$.each(json.data.contentList,function(index,item){
										//console.log(item.text)
										if(item.text){
											$("#content").append($('<p class="text">'+item.text+'</P>'));
										}else{
											$("#content").append($('<img class="textimg" src="'+item.image.url+'"/>'));
										}
									});
									
									//输入框
									$("#page").append($('<div class="replys clearfloat"><input type="text" id="replycomment" placeholder="请输入回复内容" /></div>'));
									$("#down").show();
									//底部
									$("#bottomreply").css('display','block');
									$("#bottomreply .replyes").find('span').eq(0).html('评论 '+json.data.countReview+'');
									//底部收藏
									if(json.data.isFavorite==1){
										$(".favorites span").attr('favorite','1');
										$(".favorites span").css('background','url(../../resources/shop/mobile/images//favorite2.png) no-repeat');
										$(".favorites span").css('background-size','contain');
									}
									favoriteval = json.data.countFavorite;
									$(".favorites").find('span').eq(0).html('收藏 '+favoriteval+'');
									
									// 渲染回复评论
										var data = json.data.articleReviews;
										
										for(var i=0;i<data.length;i++){
										  
											$("#comment").append($('<li userid="'+data[i].member_id+'" class="commentcontent"><div class="clearfloat"><img class="picture"  src="'+data[i].member_headUrl+'" /><h4 class="replyusername">'+data[i].member_nickname+'</h4><h3 class="time">'+$.myTime.UnixToDate(data[i].createDate,true)+'</h3></div><div class="reply" ><p replyname="'+data[i].member_nickname+'" replyid="" reviewid="'+data[i].id+'">'+data[i].content+'</p></div></li>'));
											if(data[i].articleReplys.length==0){
												$(".reply").append('');
											}else if(data[i].articleReplys.length!=0){
												var index = i;
												
												var ele = $("#comment").children().eq(index);
												for(var j=0;j<data[i].articleReplys.length;j++){
													ele.find(".reply").append('<p reviewid="'+data[i].id+'" replyid="'+data[i].articleReplys[j].id+'" replyname="'+data[i].articleReplys[j].member_nickname+'"><strong nicknameid="'+data[i].articleReplys[j].id+'" >'+data[i].articleReplys[j].member_nickname+'</strong> 回复  <strong>'+data[i].articleReplys[j].commentByUserNickname+'</strong>:'+data[i].articleReplys[j].content+'</p>');
													
												}
												
											}
											
										}
										
									}
										
								}
					});
					//收藏
					$(".favorites").click(function(){
						var $favoritespan = $(".favorites span");
						//console.log($(".favorites span").attr('favorite'))
						if($favoritespan.attr('favorite')==0){
							favoriteval++;
							$favoritespan.html('收藏 '+favoriteval+'');
							$favoritespan.attr('favorite','1');
							$favoritespan.css('background','url(../../resources/shop/mobile/images//favorite2.png) no-repeat');
							$favoritespan.css('background-size','contain');
							$.ajax({
								type:"POST",
								url:"http://192.168.1.199:8090/shopxx/mobile/member/article/addFavorite.jhtml",
								async:true,
								data:{
									articleId:xx,
									token:token
								}
							});
						}else if($favoritespan.attr('favorite')==1){
							favoriteval--;
							$favoritespan.html('收藏 '+favoriteval+'');
							$favoritespan.attr('favorite','0');
							$favoritespan.css('background','url(../../resources/shop/mobile/images//favorite1.png) no-repeat');
							$favoritespan.css('background-size','contain');
							$.ajax({
								type:"POST",
								url:"http://192.168.1.199:8090/shopxx/mobile/member/article/cancleFavorite.jhtml",
								async:true,
								data:{
									articleId:xx,
									token:token
								}
							});
						}
					});
					//关注
					var $focus = $(".focus");
					$focus.click(function(){
						if($focus.html()=="关注"){
							$focus.html("已关注").css('background','#d2d2d2');//#f4c400
							$.ajax({
								url: "http://192.168.1.199:8090/shopxx/mobile/member/article/addAttention.jhtml",
								type: "POST",
								dataType: "json",
								async:true,
								data:{memberId:memberid,token:token},
								
								
							});
						}else if($focus.html()=="已关注"){
							$focus.html("关注").css('background','#f4c400');//#d2d2d2
							$.ajax({
								url: "http://192.168.1.199:8090/shopxx/mobile/member/article/cancleAttention.jhtml",
								type: "POST",
								dataType: "json",
								async:true,
								data:{memberId:memberid,token:token},
							});
						}
						
					});
					//点赞
					
					$zan.click(function(){
						if($zan.attr('iszan')==0){
							zanval++;
							$zan.attr('iszan','1');
							$('#down h4').text(''+zanval+'赞');
							$zan.css('background','url(../../resources/shop/mobile/images/zan2.png) no-repeat');
							$zan.css('background-size','cover');
							$.ajax({
								url: "http://192.168.1.199:8090/shopxx/mobile/member/article/addArticleLike.jhtml",
								type: "POST",
								dataType: "json",
								async:true,
								data:{articleId:xx,token:token},
							});
						}else if($('.zan').attr('iszan')==1){
							zanval--;
							$zan.attr('iszan','0');
							$('#down h4').text(''+zanval+'赞');
							$zan.css('background','url(../../resources/shop/mobile/images/zan1.png) no-repeat');
							$zan.css('background-size','cover');
							$.ajax({
								url: "http://192.168.1.199:8090/shopxx/mobile/member/article/cancelArticleLike.jhtml",
								type: "POST",
								dataType: "json",
								async:true,
								data:{articleId:xx,token:token},
							});
						}
					});
					var liindex = 0;
					var pindex = 0;
					
					//评论回复
					$('#comment').delegate('li','touchstart',function(e){
						var ev = e || window.event;
						var target = ev.target || ev.srcElement;
						if(target.nodeName=='LI'){
							showreply();
						}
						liindex = $(this).index();
						
						memberIds = $(this).attr('userid');
						//alert(target.nodeName)
					});
					
					
					
					
					$('#comment').delegate('p,img','click',function(e){//事件委托  把评论委托给父级处理
						var $replycomment = $("#replycomment");
						var ev = e || window.event;
						var target = ev.target || ev.srcElement;
						if(target.nodeName=='IMG'){//判断目标是不是头像
							
							jsObj.getMemberId(memberIds);
							
						}else{
							
							$replycomment.val("");
							$replycomment.focus();//使输入框获取焦点
							pindex = $(this).index();
							$(".replys").css('display','block');
							$("#bottomreply").css('display','none');
							$("#check").val('q');
							obj = $(this).parent(".reply");
							//console.log(obj)
							//$('#comment').find('li').eq(liindex).find('.reply').eq(0)
							 //console.log(obj)
							 replyid = obj.find('p').eq(pindex).attr('reviewid');
							 reviewid = obj.find('p').eq(pindex).attr('replyid');
							 replyname = obj.find('p').eq(pindex).attr('replyname');
							 $replycomment.attr('placeholder','回复：'+replyname+'');
						}
						
						
						return false;
					});
					$("#content").click(function(){
						$("#check").val('s');
						$("#replycomment").attr('placeholder','说点什么吧...');
						showreply();
					})
					//点击底部评论
					$("#bottomreply .replyes").click(function(){
						$("#check").val('s');
						$("#replycomment").attr('placeholder','说点什么吧...');
						$(".replys").css('display','block');
						$("#bottomreply").css('display','none');
					});
					//引用评论回复方法
					$(document).keydown(function(ev){
						if(ev.keyCode==13){
							showreply();
							replyuser(replyid,reviewid,obj);
						}
					});
					
					//显示底部
					function showreply(){
						$(".replys").css('display','none');
						$("#bottomreply").css('display','block');
					}
					
					
					// 回复评论
					
					function replyuser(reviewid,replyid,obj){
						
								var keyValue = $("#replycomment").val();
								if(keyValue==''){
									
								}else if($("#check").val()=='q'){//回复评论
									$.ajax({
										url: "http://192.168.1.199:8090/shopxx/mobile/member/article/addReply.jhtml",
										type: "POST",
										dataType: "json",
										async:true,
										data:{
											token:token,
											reviewId: reviewid,
											replyId:replyid,
											content:keyValue,
											articleId: xx
										},
										success:function(json){
											console.log(obj);
											obj.append('<p replyname="'+json.data.member_nickname+'" reviewid="'+json.data.id+'" replyid="json.data" ><strong  id="replyname">'+json.data.member_nickname+'</strong>回复<strong>'+json.data.commentByUserNickname+'</strong>:'+json.data.content+'</p>');
											$("#replycomment").val("");
											$("#replycomment").attr('placeholder',"");
										},
										complete:function(){
											return;
										},
										error:function(){
											console.log('出错');
										}
									})
								}else if($("#check").val()=='s'){//回复文章
									$.ajax({
										url: "http://192.168.1.199:8090/shopxx/mobile/member/article/addReview.jhtml",
										type: "POST",
										dataType: "json",
										async:true,
										data:{
											articleId: xx,
											content:keyValue,
											token:token
											
										},
										success:function(json){
											switchs=true;
											$("#replycomment").val("");
											$("#comment").prepend($('<li userid="'+json.data.member_id+'" class="commentcontent"><div class="clearfloat"><img class="picture" id="pic" src="'+json.data.member_headUrl+'" /><h4 id="usernames" >'+json.data.member_nickname+'</h4><h3 class="time">'+$.myTime.UnixToDate(json.data.createDate,true)+'</h3></div><div class="reply" ><p reviewid="'+json.data.id+'" replyid="" replyname="'+json.data.member_nickname+'" id="replys">'+json.data.content+'</p></div></li>'));
										},
										error:function(){
											console.log('');
										}
									});
								}
								
							
						
						return false;
					}
					
					
					
					//获取数据
					function getJson(pageNumber) {
						  if (flag) {
							 flag = false;
							 x++;
							$.ajax({
								url: "http://192.168.1.199:8090/shopxx/mobile/member/article/detail.jhtml",
								type: "GET",
								dataType: "json",
								data: {articleId:xx,pageNumber:x,pageSize:pageSize,type:orderParm},
								cache: false,
								success: function(json) {
									var order = pageSize*x-pageSize;
									//console.log(json)
								  if (json.result == '1') {
									  var data = json.data.articleReviews;
										//console.log(data)
										for(var i=0;i<data.length;i++){
										   // console.log(data)
											$("#comment").append($('<li userid="'+data[i].member_id+'" class="commentcontent"><div class="clearfloat"><img class="picture" id="pic'+i+'" src="'+data[i].member_headUrl+'" /><h4 class="replyusername">'+data[i].member_nickname+'</h4><h3 class="time">'+$.myTime.UnixToDate(data[i].createDate)+'</h3></div><div class="reply" ><p replyname="'+data[i].member_nickname+'" replyid="'+data[i].member_id+'" reviewid="'+data[i].id+'">'+data[i].content+'</p></div></li>'));
											if(data[i].articleReplys.length==0){
												$(".reply").append('');
											}else if(data[i].articleReplys.length!=0){
												var index = i;
												//console.log(ele);
												var ele = $("#comment").children().eq(index);
												for(var j=0;j<data[i].articleReplys.length;j++){
													ele.find(".reply").append('<p reviewid="'+data[i].id+'" replyid="'+data[i].articleReplys[j].id+'" replyname="'+data[i].articleReplys[j].member_nickname+'"><strong nicknameid="'+data[i].articleReplys[j].id+'" >'+data[i].articleReplys[j].member_nickname+'</strong>回复<strong>'+data[i].articleReplys[j].commentByUserNickname+'</strong>:'+data[i].articleReplys[j].content+'</p>');
													
												}
												
											}
											
										}
									
									  $(".bottom").hide();       	
							        	
								  }else {
									  $(".bottom").show().html("别滚动了，已经到底了。。。");
							      }
								  flag = true;
								}
							});
							
						  }
						 }

			});