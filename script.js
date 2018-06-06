$(document).ready(function(){
	
});

var on = true;


var ws = new WebSocket('ws://172.17.18.152:8025/');

ws.onmessage = function (event) {
	console.log(event.data);
	if(event.data == 'on'){
		$('.container').show();
	} else if (event.data == 'off'){
		$('.container').hide();	
	}
};

// ws.onopen = function (event) {
//	console.log(event)
// }

function getImage(url){
	$.ajax({
		url: 'imagePaser.php',
		data: {
			url: url
		},
		success: function(data){
			if (data.src) {
				$('#images .content').prepend(
					$('<img>').attr('src', data.src)
				)
			}
			$('#feed h1').each(function(idx, item) {
				
				if ($(item).offset().top > window.innerHeight * 1.5) {
					$(item).remove()
				}
			})

			$('#images img').each(function(idx, item) {
				//console.log($(item).offset().top);
				if ($(item).offset().top > window.innerHeight * 1.5) {
					$(item).remove()
				}
			})
		}
	});
}

(function() {
	var eventsource = new EventSource("https://stream.wikimedia.org/v2/stream/recentchange");
	
	var feedNode = document.getElementById('feed');
	var dataNode = document.getElementById('data');
	var rateMinNode = document.getElementById('rate-min');
	var rateAvgNode = document.getElementById('rate-avg');
	var errorNode = document.createElement('div');
	errorNode.className = 'alert alert-danger';
	var infoNode = document.createElement('div');
	infoNode.className = 'alert alert-info';
	var updateBuffer = makeDisplayBuffer(50);
	var freq;
	printEvent({
	type: 'info',
	message: 'Connecting...'
	});
	eventsource.onopen = function() {
	printEvent({
		type: 'info',
		message: 'Connected! Listening for events...'
	});
	freq = new Frequency(1000, function (count, average) {
		rateMinNode.textContent = count;
		rateAvgNode.textContent = average;
	});
	};

	eventsource.onmessage = function(msg) {
	if (freq) { freq.add(1); }
		printEvent({type: 'message', data: msg.data});
	};

	eventsource.onerror = function(msg) {
	// Don't print {isTrusted: true}.	(Is this an error?)
	if (!msg.isTrusted) {
		printEvent({
		type: 'error',
		data: msg
	  });
	}
  };
  var idx = 0;
  function printEvent(event) {
	var node;
	if (event.type === 'message') {
		var d = JSON.parse(event.data);
		var title = d.title.split(':').pop()

		if(idx < 50){

			if(d.parsedcomment.indexOf('jpg') !== -1 || d.parsedcomment.indexOf('png') !== -1){

				var elements = $.parseHTML(d.parsedcomment);
				if(elements.length > 0){
					var link = elements[0].innerHTML;
					if(link !== undefined){
						getImage('https://commons.wikimedia.org/wiki/'+link);
						$(feedNode).prepend($('<h1>' + title + '</h1>'));
					}
				}
			}
			//idx++;
		} else {
			$('#container').hide();
		}
	  //console.log(event.data);
	  if(on){
	  	
	  	// var node = $(d.parsedcomment)
	  	// console.log(title, node)
	  	// console.log('-------')
	  	var node = document.createTextNode(d.comment + '\n\n');
	   
	  	$(dataNode).find('.content').prepend(node);
	 	
	  	updateBuffer(node);	

	  	if (d.parsedcomment.indexOf('jpg') !== -1) {
	   
	  	// $(feedNode).prepend($('<h1>' + title + '</h1>')).prepend(node);
	  		//$(feedNode).prepend($('<p>' + title + '</p>'));
	  	}
	 	
	  	
	  }
	  
	} else if (event.type === 'error') {
	  $(errorNode).empty().text('ERROR: ' + JSON.stringify(event.data));
	  if (!errorNode.parentNode) {
		$(feedNode).before(errorNode);
	  }
	} else if (event.type === 'info') {

	  if (!infoNode.parentNode) {
		$(feedNode).prepend(infoNode);
		updateBuffer(infoNode);
	  }
	}
  }

  function makeDisplayBuffer(size) {
	var buffer = [];
	return function (element) {
	  buffer.push(element);
	  if (buffer.length > size) {
		var popped = buffer.shift();
		popped.parentNode.removeChild(popped);
		}
	}
	}
}());

function Frequency(interval, callback) {
	var freq = this;
	var rAF = window.requestAnimationFrame || setTimeout;

	this.interval = interval;
	this.callback = callback;
	this.count = 0;
	this.total = 0;
	this.since = this.start = this.now();
	function checker() {
	freq.check();
	rAF(checker);
	}
	rAF(checker);
}
Frequency.prototype.now = ( function () {
	var perf = window.performance;
	return perf.now ?
	function () { return perf.now(); } :
	function () { return +new Date(); };
}() );
Frequency.prototype.add = function (count) {
	this.count += count;
	this.total += count;
	this.check();
};
Frequency.prototype.check = function () {
	var count, avg, ellapsedTotal;
	var ellapsed = this.now() - this.since;
	if (ellapsed >= this.interval) {
	ellapsedTotal = this.now() - this.start;
	count = this.count;
	// One optional digit
	avg = (this.total / (ellapsedTotal / this.interval)).toFixed(1).replace('.0', '');
	this.since = this.now();
	this.count = 0;
	this.callback(count, avg);
	}
};