~function (pro) {
    //->获取URL地址栏问号后面的参数值及HASH值
    function queryURLParameter() {
        var obj = {},
            reg = /([^?=&#]+)=([^?=&#]+)/g;
        this.replace(reg, function () {
            obj[arguments[1]] = arguments[2];
        });
        reg = /#([^?=&#]+)/;
        if (reg.test(this)) {
            obj["hash"] = reg.exec(this)[1];
        }
        return obj;
    }

    //->格式化时间字符串
    function formatTime(template) {
        template = template || "{0}年{1}月{2}日 {3}时{4}分{5}秒";
        var _this = this,
            ary = _this.match(/\d+/g);//->[2016,05,19]
        template = template.replace(/\{(\d+)\}/g, function () {
            var val = ary[arguments[1]];
            typeof val === "undefined" ? val = 0 : null;
            val = val.length < 2 ? "0" + val : val;
            return val;
        });
        return template;
    }

    pro.queryURLParameter = queryURLParameter;
    pro.formatTime = formatTime;
}(String.prototype);


//->REM
~function (desW) {
    var winW = document.documentElement.clientWidth,
        oMain = document.getElementById("main"),
        n = winW / desW;
    if (winW > desW) {
        oMain.style.width = desW + "px";
        return;
    }
    document.documentElement.style.fontSize = n * 100 + "px";
}(640);

//->HEADER  MENU
~function () {
	var $header = $('.header'),
		$menu = $('header').find('.menu'),
		$nav = $header.children('.nav');

	$menu.tap(function() {
		if ($(this).attr('isBlock') === 'true') {
			$nav.css({
				height: '0'
			});
			var timer = window.setTimeout(function () {
				$nav.css({
					padding: '0'
				});
			}, 300)
			window.clearTimeout();
			$(this).attr('isBlock', 'false')
			return;
		};
		$nav.css({
			padding: '.1rem 0',
			height: '2.22rem'
		});
		$(this).attr('isBlock', 'true')
	});
} ();

//->MATHC INFO
var matchRender = (function () {

	var $matchInfo = $('.matchInfo'),
		$matchInfoTemplate = $('#matchInfoTemplate');

	//->绑定事件
	function bindEvent() {
		var $bottom = $matchInfo.children('.bottom'),
			$bottomLeft = $bottom.children('.home'),
			$bottomright = $bottom.children('.away');
		//->获取本地存储的信息,判断是否有支持
		var support = localStorage.getItem('support');
		if (support) {
			support = JSON.parse(support);
			if (support.isTap) {
				$bottom.attr('isTap', true);
				support.type == 1 ? $bottomLeft.addClass('bg') : $bottomright.addClass('bg')
			}
		}

		$matchInfo.tap (function(ev) {
			var tar = ev.target,
				tarTag = tar.tagName,
				tarP = tar.parentNode,
				$tar = $(tar),
				tarInn = $tar.html();

			// ->支持操作
			if (tarTag === 'SPAN' && tarP.className === 'bottom' && $tar.className !== 'type') {

				if ($bottom.attr('isTap') === 'true') return;

				//增加背景和数字
				$tar.html(parseFloat(tarInn) + 1).addClass('bg');

				//->重新计算进度条
				$matchInfo.children('.middle').children('span').css('width', (parseFloat($bottomLeft) / (parseFloat($bottomLeft) + parseFloat($bottomright))) * 100 + '%')
				//告诉服务器支持的是谁
				$.ajax({
					url: 'http://matchweb.sports.qq.com/html/matchStatV37?mid=100000%3A1469012&type='+ $tar.attr('type'),
					dataType: 'jsonp'
				});

				//只能点击一次
				$bottom.attr('isTap', true)
				localStorage.setItem('support', JSON.stringify({"isTap":true,"type":$tar.attr('type')}));
			}
		});
	}

	function bindHTML (matchInfo) {
		$matchInfo.html(ejs.render($matchInfoTemplate.html(), {matchInfo: matchInfo}));

		//控制进度条:定时器是给HTML一定的渲染时间
		window.setTimeout(function() {
			var leftNum = parseFloat(matchInfo.leftSupport),
				rightNum = parseFloat(matchInfo.rightSupport);
			$matchInfo.children('.middle').children('span').css('width', (leftNum / (leftNum + rightNum)) * 100 + '%')
		}, 500);

		bindEvent();
	}


	return {
		init: function () {
			//->GET DATA
			$.ajax({
				url: 'http://matchweb.sports.qq.com/html/matchDetail?mid=100000%3A1469012',
				dataType: 'jsonp',
				success: function (res) {
					if (res && res[0] === 0) {
						res = res[1];
						var matchInfo = res['matchInfo'];
						matchInfo['leftSupport'] = res['leftSupport'];
						matchInfo['rightSupport'] = res['rightSupport'];

						//绑定数据
						bindHTML(matchInfo);
					}
				}
			})
		}
	}
}) ();
matchRender.init();

//->MATCH LIST
var matchListRender = (function () {
	var $matchList = $('.matchList'),
		$matchListUL = $matchList.children('ul'),
		$matchListTemplate = $('#matchListTemplate');

	function bindList(matchList) {
		$matchListUL.html(ejs.render($matchListTemplate.html(), {matchList: matchList})).css('width', parseFloat(document.documentElement.style.fontSize) * 2.4 * matchList.length + 20 + 'px' );

		//实现局部滚动
		var matchScroll = new IScroll('.matchList', {
			scrollX: true,
			click: true
		});
	}

	return {
		init: function () {
			$.ajax({
				url: 'http://matchweb.sports.qq.com/html/matchStatV37?mid=100000%3A1469012',
				dataType: 'jsonp',
				success: function (res) {
					if (res && res[0] === 0) {
						res = res[1]['stats'];
						var matchList = null;
						$.each(res, function (index, item) {
							if (item['type'] == 9) {
								matchList = item['list'];
								return false;
							}
						});
						//->绑定数据
						bindList(matchList);
					}
				}
			})
		}
	}
}) ();
matchListRender.init();

var replyListRender = (function () {

	var $replyList = $('.replyList'),
		$replyListUL = $replyList.children('ul'),
		$replyListTemplate = $('#replyListTemplate');
	function bindList(replyList) {
		$replyListUL.html(ejs.render($replyListTemplate.html(), {replyList:replyList})).css('width', parseFloat(document.documentElement.style.fontSize) * 2.4 * replyList.length + 20 + 'px');
		var replyScroll = new IScroll('.replyList', {
			scrollX: true,
			scrollY: false,
			click: true
		});
	}


	return {
		init: function () {
			$.ajax({
				url: 'http://matchweb.sports.qq.com/html/matchStatV37?mid=100000%3A1469012',
				dataType: 'jsonp',
				success: function (res) {
					if (res && res[0] == 0) {
						res = res[1]['stats'];
						var replyList = null;
						$.each(res, function (index, item) {
							if (item['type'] == 10) {
								replyList = item['list'];
								return false;
							}
						})
						bindList(replyList);
					}
				}
			})
		}
	}
}) ();
replyListRender.init();

var newsListRender = (function () {

	var $newsList = $('.newsList'),
		$newsListUL = $newsList.children('ul'),
		$newsListTemplate = $('#newsListTemplate');

	function bindList (newsList) {
		$newsListUL.html(ejs.render($newsListTemplate.html(), {newsList:newsList}));
	}

	return {
		init: function () {
			$.ajax({
				url: 'http://matchweb.sports.qq.com/html/matchStatV37?mid=100000%3A1469012',
				dataType: 'jsonp',
				success: function (res) {
					if (res && res[0] == 0) {
						res = res[1]['stats'];
						var newsList = null;
						$.each(res, function (index, item) {
							if (item['type'] == 5) {
								newsList = item['newsList'];
								return false;
							}
						});
						bindList(newsList);
					}
				}
			})
		}
	}
})();
newsListRender.init();

/*图片懒加载*/
echo.init();

