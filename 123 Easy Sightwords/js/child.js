var SW = (function () {

	var SW = function () {
		$('#logout').on("click", function () {
			window.localStorage.removeItem("user_id");
			window.localStorage.clear();
			$.mobile.changePage("index.html", {transition: "slideup"});
			return false;
		});
	};

	SW.prototype.error = function () {
		$("div[data-role='content']").append(
			'<div class = "ui-body ui-body-b">' +
			'<h4>Server is momentarily unavailable.</h4>' +
			'<h4>Please try back at a later time.</h4>' +
			'<h4>We are sorry for the inconvenience!</h4>' +
			'</div>'
		);
	};

	return SW;
})();

$(document).on("pagebeforeshow", "#index", function () {
	var userId = window.localStorage.getItem("user_id");
	if (userId) {
		$.mobile.changePage("profile.html", {transition: "slideup"});
		return false;
	} else {
		$('.index_page').show();
	}
});

$(document).on("pagebeforeshow", "#profile", function () {
	new SW();
	var userId = window.localStorage.getItem("user_id");

	if (!userId) {
		window.localStorage.clear();
		$.mobile.changePage("index.html", {transition: "slideup"});
		return false;
	}

	var kid = new CHILD();
	kid.parseChild();
});

$(document).on("pagebeforeshow", "#add_child", function () {
	var userId = window.localStorage.getItem("user_id");

	if (userId) {
		$('#user_id').val(userId);
		var _child = new CHILD();
		_child.addChild();
		_child.loadFormData();
	}
});

$(document).on("pagebeforeshow", "#child", function () {
	var id  = $.url('?id');
	var kid = new CHILD();
	if (id) {
		kid.getChildName();
		kid.getStats();
		$('#edit_user').attr("href", "add_child.html?child=" + id);
	}
});

$(document).on("pagebeforeshow", "#sightwords", function () {
	new SIGHTWORDS();
});

$(document).on("pagebeforeshow", "#login", function () {
	var userId = window.localStorage.getItem("user_id");

	if (userId) {
		$.mobile.changePage("profile.html", {transition: "slideup"});
		return false;
	} else {
		var tod = new USER();
		tod.logIn();
	}
});

$(document).on("pagebeforeshow", "#create", function () {
	var tod = new USER();
	tod.createAccount();
});

var CHILD = (function () {

	var CHILD = function () {
		new SW();

		this.getScore();
		var _this = this;

		var idd = $.url('?child');
		if (idd) {
			$('#remove_user_container').show();
		}

		$('#remove_child').on("click", function () {
			_this.removeChild();
			return false;
		});
	};

	CHILD.prototype.getBase = function (func) {
		return 'http://sightwords.123easywebsites.com/' + func;
	};

	CHILD.prototype.removeChild = function () {
		var _this = this;
		var id    = $.url('?id');
		$.ajax({
			type   : "POST",
			url    : _this.getBase('removechild'),
			data   : {id: id},
			success: function (data) {
				if (data) {
					$.mobile.changePage("profile.html", {transition: "slideup"});
				}
			}
		});
	};

	CHILD.prototype.addChild = function () {
		var _this = this;
		$('#add_child_page').find('form').submit(function () {
			var formData = $(this).serializeArray();
			var gr       = $('#grade').val();
			var total    = 1;
			if (gr) {
				total = _this.addArray(gr);
			}
			if (_this.validateFormData()) {
				_this.addChildAjax(formData, total);
			}
			return false;
		});
	};

	CHILD.prototype.loadFormData = function () {
		var id = $.url('?child');
		if (id) {
			var childId = 'child_' + id;
			var child   = jQuery.parseJSON(window.localStorage.getItem(childId));
			$('#name').val(child.name);
			$('#age').val(child.age);
			$('#kid_id').val(child.kid_id);
			$("span:contains('Add Child')").html('Edit Child');
		}
	};

	CHILD.prototype.validateFormData = function () {
		var _this    = this;
		var name     = $('#name');
		var age      = $('#age');
		var grade    = $('#grade').val();
		var addGrade = 0;
		if (grade) {
			addGrade = this.addArray(grade);
		}

		if (!name.val()) {
			_this.dialog('Name is empty');
		} else if (!age.val()) {
			_this.dialog('Age is empty');
		} else if (addGrade === 0) {
			_this.dialog('Please select a grade');
		} else {
			return true;
		}
	};

	CHILD.prototype.addArray = function (data) {
		var total = 0;
		for (var i = 0; i < data.length; i++) {
			total += parseInt(data[i], 10);
		}
		return total;
	};

	CHILD.prototype.addChildAjax = function (data, total) {
		var _this   = this;
		var newData = _this.serializeObject(data);
		$.ajax({
			type   : "POST",
			url    : _this.getBase('addchild'),
			data   : {
				kid_id : newData.kid_id,
				user_id: newData.user_id,
				name   : newData.name,
				age    : newData.age,
				grade  : total
			},
			success: function (data) {
				if (data) {
					$.mobile.changePage("profile.html", {transition: "slideup"});
				}
			}
		});
	};

	CHILD.prototype.getChild = function (cb) {
		var _this  = this;
		var userId = window.localStorage.getItem("user_id");
		$.ajax({
			type   : "POST",
			url    : _this.getBase('getchild'),
			data   : {userid: userId},
			success: function (data) {
				$('.loader').hide();
				try {
					data = JSON.parse(data);
					_this.loading({show: 'hide', text: '', visibile: false, theme: 'Z', html: ''});
					cb(data);
				} catch (err) {
					var module = new SW();
					module.error();
				}
			},
			error  : function () {
				console.log('error');
			}
		});

	};

	CHILD.prototype.parseChild = function () {
		var _this = this;
		this.loading({show: 'show', text: '', visibile: false, theme: 'Z', html: ''});
		this.getChild(function (data) {
			var html = '<li data-role="list-divider"><h2>Child list</h2></li>';
			$.each(data, function (k, v) {
				window.localStorage.removeItem("child_" + v.kid_id);
				window.localStorage.setItem("child_" + v.kid_id, JSON.stringify(v));
				html += '<li class="load_child"><a href="child.html?id=' + v.kid_id + '" data-role="button">' + _this.up(v.name) + ', ' + v.age + '</a></li>';
			});
			$("#list_child").append(html).listview("refresh");
		});
	};

	CHILD.prototype.up = function (word) {
		return word[0].toUpperCase() + word.substr(1);
	};

	CHILD.prototype.getChildName = function () {
		var child = this.parseUrl();
		if (child) {
			$('#header_title').html(child.name);
		}
	};

	CHILD.prototype.getStats = function () {
		var _this = this;
		var child = this.parseUrl();
		var grade = this.parseGradeName(child.grade);
		var html  = '';
		var kidId = $.url('?id');
		var keyword;

		for (var i = 0; i < grade.length; i++) {

			keyword = grade[i].toLowerCase();

			if (grade[i] === 'Preschool') {
				html += '<ul data-role="listview" data-inset="true">' +
					'<li data-role="list-divider"><h2>' + grade[i] + ' Sightwords</h2></li>';
				for (var m = 1; m < 3; m++) {
					html += '<li><a class="' + keyword + '" id="type_' + m + '" href="sightwords.html?type=1&name=Preschool&s=' + m + '&kid_id=' + kidId + '" >' + _this.parseSet(m) + ' set of 25</a><span class="ui-li-count">0 stars</span></li>';
				}
				html += '</ul>';
			}

			if (grade[i] === 'Kindergarten') {
				html += '<ul data-role="listview" data-inset="true">' +
					'<li data-role="list-divider"><h2>' + grade[i] + ' Sightwords</h2></li>';
				for (var n = 1; n < 3; n++) {
					html += '<li><a class="' + keyword + '" id="type_' + n + '" href="sightwords.html?type=2&name=Kindergarten&s=' + n + '&kid_id=' + kidId + '">' + _this.parseSet(n) + ' set of 25</a><span class="ui-li-count">0 stars</span></li>';
				}
				html += '</ul>';
			}

			if (grade[i] === '1st Grade') {
				html += '<ul data-role="listview" data-inset="true">' +
					'<li data-role="list-divider"><h2>' + grade[i] + ' Sightwords</h2></li>';
				for (var o = 1; o < 9; o++) {
					html += '<li><a class="' + keyword + '" id="type_' + o + '" href="sightwords.html?type=4&name=1st%20Grade&s=' + o + '&kid_id=' + kidId + '">' + _this.parseSet(o) + ' set of 25</a><span class="ui-li-count">0 stars</span></li>';
				}
				html += '</ul>';
			}
		}

		$('.loader').hide();
		$('#keywords_holder').append(html);
		$("#child").page("destroy").page();
	};

	CHILD.prototype.getScore = function () {
		var _this  = this;
		var userId = window.localStorage.getItem('user_id');
		var kidId  = $.url('?id');

		if (kidId) {
			$.ajax({
				type   : "POST",
				url    : _this.getBase('getscore'),
				data   : {user: userId, kid: kidId},
				success: function (data) {
					data = JSON.parse(data);
					$.each(data, function (key, val) {
						var newKey = key + 1;
						var _id    = 'type_' + val.type;
						var _class = val.keyword.toLowerCase();
						$("#" + _id + "." + _class).parent().find('span').html(val.points + ' stars');
						window.localStorage.setItem('child_' + val.kid_id + '_score_' + newKey, JSON.stringify(val));
					});
				}
			});
		}

	};

	CHILD.prototype.parseGradeName = function (grade) {
		var gradeName = [];
		if (grade == 1) {
			gradeName.push('Preschool');
		} else if (grade == 2) {
			gradeName.push('Kindergarten');
		} else if (grade == 4) {
			gradeName.push('1st Grade');
		} else if (grade == 8) {
			gradeName.push('2nd Grade');
		} else if (grade == 3) {
			gradeName.push('Preschool');
			gradeName.push('Kindergarten');
		} else if (grade == 5) {
			gradeName.push('Preschool');
			gradeName.push('1st Grade');
		} else if (grade == 6) {
			gradeName.push('Kindergarten');
			gradeName.push('1st Grade');
		} else if (grade == 7) {
			gradeName.push('Preschool');
			gradeName.push('Kindergarten');
			gradeName.push('1st Grade');
		}
		return gradeName;
	};

	CHILD.prototype.serializeObject = function (a) {
		var o = {};
		$.each(a, function () {
			if (o[this.name]) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};

	CHILD.prototype.parseUrl = function () {
		var childId = 'child_' + $.url('?id');
		return jQuery.parseJSON(window.localStorage.getItem(childId));
	};

	CHILD.prototype.dialog = function (text) {
		var pre        = $('pre');
		var formDialog = $('#form_dialog');

		pre.html(text);
		formDialog.trigger('click');
	};

	CHILD.prototype.loading = function (data) {
		$.mobile.loading(data.show, {
			text       : data.text,
			textVisible: data.visibile,
			theme      : data.theme,
			html       : data.html
		});
	};

	CHILD.prototype.parseSet = function (v) {
		if (v === 1) {
			var name = 'First';
		} else if (v === 2) {
			name = 'Second';
		} else if (v === 3) {
			name = 'Third';
		} else if (v === 4) {
			name = 'Fourth';
		} else if (v === 5) {
			name = 'Fifth';
		} else if (v === 6) {
			name = 'Sixth';
		} else if (v === 7) {
			name = 'Seventh';
		} else if (v === 8) {
			name = 'Eighth';
		}
		return name;
	};

	return CHILD;
})();

var MULTIMEDIA = (function () {
	var my_media                   = null;
	var MULTIMEDIA                 = function () {
	};
	// Play audio
	MULTIMEDIA.prototype.playAudio = function (src, success, error) {
		my_media = new Media(src, success, error);
		my_media.play();
		return my_media;
	};

	MULTIMEDIA.prototype.getPhoneGapPath = function () {
		return '/android_asset/www/';
	};

	return MULTIMEDIA;
})();

var SIGHTWORDS = (function () {
	var media = new MULTIMEDIA();

	var SIGHTWORDS = function () {
		var _this = this;
		new SW();

		this.getKeywords();
		$('#header_title').html(decodeURI($.url('?name')) + ' Sightwords');
		this.addScoreToHtml();

		var total = $(window).height();

		$(".swiper-container,.swiper-slide").css({
			'height': Math.round(total / 4)
		});

		$("select").bind("change", function () {
			_this.practiceMode($(this).val());
		});
	};

	SIGHTWORDS.prototype.getBase = function (func) {
		return 'http://sightwords.123easywebsites.com/' + func;
	};

	SIGHTWORDS.prototype.practiceMode = function (sv) {
		var poff = $('#practice_off');
		var pon  = $('#practice_on');
		if (sv === 'on') {
			poff.show();
			pon.hide();
		} else if (sv === 'off') {
			pon.show();
			poff.hide();
		}
	};

	SIGHTWORDS.prototype.getKeywords = function () {
		var _this             = this;
		var grade             = $.url('?type');
		var name              = $.url('?name');
		var s                 = $.url('?s');
		var kidId             = $.url('?kid_id');
		var slideName         = 'slide_' + kidId + '_' + grade + '_' + s;
		var url               = 'type=' + grade + '&name=' + name + '&s=' + s + '&kid_id=' + kidId + '';
		var sightDialogFinish = $('#sight_dialog_finish');
		var popupBasics       = $("#popupBasics");
		var sightSkip         = $('#sight_skip');
		var totalPoints       = $('#total_points');

		_this.loading({show: 'show', text: '', visibile: false, theme: 'Z', html: ''});

		$.ajax({
			type   : "POST",
			url    : _this.getBase('keywords'),
			data   : {grade: grade, s: s},
			success: function (data) {
				$('.loader').hide();
				_this.loading({show: 'hide', text: '', visibile: false, theme: 'Z', html: ''});

				var tutorial = window.localStorage.getItem("tutorial");
				if (!tutorial) {
					$("#popupTutorial").popup('open');
					window.localStorage.setItem("tutorial", "1");
				}

				data     = JSON.parse(data);
				var html = '', swipper = $('.swiper-wrapper');

				$.each(data, function (k, v) {
					html += '<div class="swiper-slide black_theme" id="' + v.keywords_id + '">' + v.keyword + '</div>';
				});

				swipper.append(html);

				var slider = new Swiper('.swiper-container', {
					speed       : 750,
					onlyExternal: true
				});

				var currentSlide = window.localStorage.getItem(slideName);
				//var lastSlide = slider.getLastSlide();

				if (currentSlide) {
					slider.swipeTo(currentSlide, 1);
				}

				// window skip
				sightSkip.click(function (e) {
					e.preventDefault();

					if (slider.activeSlide === 24) {
						$(this).click(function () {
							sightDialogFinish.trigger('click');
						});
					}
					slider.swipeTo(slider.activeSlide + 1);
					//save current slide
					_this.addSlideToStorage(slider.activeSlide + 1, slideName);

					return false;
				});

				// window next
				$('#sight_next').click(function (e) {
					e.preventDefault();

					if (slider.activeSlide === 24) {
						$(this).click(function () {
							//trigger dialog
							$('#sight_dialog_finish').trigger('click');
							//reset slide
							_this.addSlideToStorage(0, slideName);
						});
					} else {
						_this.checkKeyword(slider.activeSlide);
					}

					return false;
				});

				// popup preview
				$('#prevk').click(function (e) {
					e.preventDefault();
					slider.swipeTo(slider.activeSlide);
					//save current slide
					_this.addSlideToStorage(slider.activeSlide, slideName);
					sightSkip.trigger("click");

					popupBasics.popup('close');

					return false;
				});

				// popup next
				$('#nextk').click(function (e) {
					e.preventDefault();
					popupBasics.popup('close');

					// add to html
					var currentPoints = parseInt(totalPoints.html());
					totalPoints.html(currentPoints + 10);
					//save current slide
					_this.addSlideToStorage(slider.activeSlide, slideName);
					// send to database
					_this.addScore(10);

					slider.swipeTo(slider.activeSlide);
					sightSkip.trigger("click");

					return false;
				});

				$('#reset_slide').click(function (e) {
					e.preventDefault();

					$('#sight_dialog_general').trigger("click");

					$('#tap_yes').on("click", function () {
						_this.addSlideToStorage(0, slideName);
						$.mobile.changePage("sightwords.html?" + url, {transition: "slideup"});
					});

					$('#tap_no').on("click", function () {
						$.mobile.changePage("sightwords.html?" + url, {transition: "slideup"});
					});

					return false;
				});

				$('#reset_score').click(function (e) {
					e.preventDefault();
					$('#sight_dialog_general').trigger("click");

					$('#tap_yes').on("click", function () {
						_this.addScore(999999);
						totalPoints.html(0);
						$.mobile.changePage("sightwords.html?" + url, {transition: "slideup"});
					});

					$('#tap_no').on("click", function () {
						$.mobile.changePage("sightwords.html?" + url, {transition: "slideup"});
					});

					return false;
				});

				//back
				$('#sight_back_on').click(function () {
					slider.swipeTo(slider.activeSlide - 1);
				});

				//say word
				$('#sight_next_say').click(function () {
					var s        = slider.activeSlide + 1;
					var keyword  = $('.swiper-slide:nth-child(' + s + ')').html();
					var kword    = media.getPhoneGapPath() + "media/" + keyword + ".3gp";
					var my_media = media.playAudio(kword, function () {
						my_media.release();
					}, function () {
						console.log('error---');
					});
				});

				//next
				$('#sight_next_on').click(function () {
					if (slider.activeSlide === 24) {
						//trigger dialog
						$(this).click(function () {
							sightDialogFinish.trigger('click');
						});
					}
					slider.swipeTo(slider.activeSlide + 1);
				});

			},
			error  : function () {
				console.log('error');
			}
		});

	};

	SIGHTWORDS.prototype.addSlideToStorage = function (slide, slideName) {
		window.localStorage.setItem(slideName, slide);
	};

	SIGHTWORDS.prototype.getScore = function () {
		var childId = 'child_' + $.url('?kid_id') + '_score_' + $.url('?s');
		return jQuery.parseJSON(window.localStorage.getItem(childId));
	};

	SIGHTWORDS.prototype.addScoreToHtml = function () {
		var score = this.getScore();
		if (score) {
			$('#total_points').html(score.points);
		}
	};

	SIGHTWORDS.prototype.addScore = function (points) {
		var _this   = this;
		var userId  = window.localStorage.getItem('user_id');
		var kidId   = $.url('?kid_id');
		var type    = $.url('?s');
		var keyword = $.url('?name');

		$.ajax({
			type   : "POST",
			url    : _this.getBase('score'),
			data   : {points: points, user: userId, kid: kidId, type: type, keyword: keyword},
			success: function () {
				console.log(points + 'points added');
			},
			error  : function () {
				console.log('error');
			}
		});
	};

	SIGHTWORDS.prototype.checkKeyword = function (s) {
		var slider  = s + 1;
		var keyword = $('.swiper-slide:nth-child(' + slider + ')').html();

		$('#see_keyword').html(keyword);
		$("#popupBasics").popup('open');

		// play the words
		var srcMain = media.getPhoneGapPath() + "media/did-you-say.3gp";
		var kword   = media.getPhoneGapPath() + "media/" + keyword + ".3gp";

		// play the first keyword
		var myMedia = media.playAudio(srcMain, function () {
			//play the second keyword
			myMedia.release();
			var my_media = media.playAudio(kword,
				function () {
					my_media.release();
					//show buttons
					$('.dialog_buttons').show();
				},
				function () {
					console.log('error');
				});
		}, function () {
			console.log('error');
		});
	};

	SIGHTWORDS.prototype.loading = function (data) {
		$.mobile.loading(data.show, {
			text       : data.text,
			textVisible: data.visibile,
			theme      : data.theme,
			html       : data.html
		});
	};

	return SIGHTWORDS;
})();

var USER = (function () {

	var USER = function () {
		new SW();

		$('#goto_index').live('click', function () {
			$.mobile.changePage("index.html", {transition: "slideup"});
			return false;
		});
		$('#goto_create').live('click', function () {
			$.mobile.changePage("create.html", {transition: "slideup"});
			return false;
		});
	};

	USER.prototype.getBase = function (func) {
		return 'http://sightwords.123easywebsites.com/' + func;
	};

	USER.prototype.createAccount = function () {
		var _this = this;
		$('#submit_create_user').submit(function () {
			var formData = $(this).serializeArray();
			if (_this.validateFormData()) {
				_this.postAjax(formData);
			}
			return false;
		});
	};

	USER.prototype.logIn = function () {
		var _this = this;
		$('#log_in').submit(function () {
			var formData = $(this).serializeArray();

			if (_this.validateLogInFormData()) {
				_this.loading({show: 'show', text: '', visibile: false, theme: 'Z', html: ''});
				_this.validateLogIn(formData);
			}
			return false;
		});
	};

	USER.prototype.validateLogIn = function (data) {
		var _this = this;
		$.ajax({
			type   : "POST",
			url    : _this.getBase('user'),
			data   : _this.serializeObject(data),
			success: function (data) {
				window.localStorage.clear();

				_this.loading({show: 'hide', text: '', visible: false, theme: 'Z', html: ''});

				if (data === 'login_failed') {
					_this.dialog('Login Failed. Please try again.');
					return false;
				} else {
					data = JSON.parse(data);

					//add to local storage
					window.localStorage.setItem("user_id", data.user_id);
					window.localStorage.setItem("email", data.email);
					window.localStorage.setItem("name", data.name);

					_this.dialog('Login Successful');

					$('#login_page_id').live('click', function () {
						$.mobile.changePage("profile.html", {transition: "slideup"});
						return false;
					});
				}
			},
			error  : function () {
				console.log('error');
			}
		});

	};

	USER.prototype.serializeObject = function (a) {
		var o = {};
		$.each(a, function () {
			if (o[this.name]) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};

	USER.prototype.validateLogInFormData = function () {
		var username = $('#username');
		var password = $('#password');
		var _this    = this;

		if (!username.val()) {
			_this.dialog('Email is empty');
		} else if (!password.val()) {
			_this.dialog('Password is empty');
		} else {
			return true;
		}
	};

	USER.prototype.validateFormData = function () {
		var _this       = this;
		var email       = $('#email');
		var displayName = $('#display_name');
		var pass        = $('#password');
		var pass_verify = $('#password_verify');

		if (!displayName.val()) {
			_this.dialog('Email is empty');
		} else if (!email.val()) {
			_this.dialog('Family Name is empty');
		} else if (!pass.val()) {
			_this.dialog('Password is empty');
		} else if (pass.val().length <= 3) {
			_this.dialog('Password too short. Minimum 4 characters');
		} else if (pass.val() !== pass_verify.val()) {
			_this.dialog('Passwords don\'t match');
		} else {
			return true;
		}
	};

	USER.prototype.postAjax = function (data) {
		var _this = this;
		$.ajax({
			type   : "POST",
			url    : _this.getBase('user'),
			data   : _this.serializeObject(data),
			success: function (data) {
				if (data.data == 'duplicate_email') {
					_this.dialog("Duplicate Email.<br>Please enter a different email.");
				} else {
					$('.dlog').attr({'id': 'goto_index'});
					_this.dialog("Account created successfuly.");

					$.mobile.changePage("index.html", {transition: "slideup"});
					return false;
				}
			},
			error  : function () {
				console.log('error');
			}
		});
	};

	USER.prototype.dialog = function (text) {
		var pre        = $('pre');
		var formDialog = $('#form_dialog');
		pre.html(text);
		formDialog.trigger('click');
	};

	USER.prototype.loading = function (data) {
		$.mobile.loading(data.show, {
			text       : data.text,
			textVisible: data.visibile,
			theme      : data.theme,
			html       : data.html
		});
	};

	return USER;
})();