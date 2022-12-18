const NUM_PUZZLES = 12;
	
// show puzzle when title is clicked
function show(n) {
	for (var i = 1; i <= NUM_PUZZLES; i++) {
		document.getElementById('main-block-' + i).style.display = 'none';
		document.getElementById('main-block-' + i).class = 'no-copy';
	}
	document.getElementById('main-block-' + n).style.display = '';
	document.getElementById('main-block-' + n).class = '';
}

// answer checkin'
async function subcheck(val, n) {
	const guess = val.toUpperCase().toString().replace(/[^a-zA-Z]/gi, "");
	var curr_state = [];
	
	for (var i = 0; i < NUM_PUZZLES; i++) {
		// currently stated answer, else empty string.
		// could be fiddled with to send arbitrary strings, so i guess caution is needed
		curr_state[i] = document.getElementById('sol-' + (i + 1)).innerHTML;
	}
	
	state_string = curr_state.join("@");
	let csrftoken = getCookie('csrftoken');		
	
	try {
		// send stuff
		let result = await fetch("/puzzle/the-minimeta-that-goes-wrong/submit", {
			method: 'POST',
			body: JSON.stringify({
				index: n,
				guess: guess,
				state: state_string,
			}),
			headers: { "X-CSRFToken": csrftoken },
		});
			
		// after result
		if (!result.ok) {
			// HTTP response code was not 2xx. Maybe introspect more...
			$('#output').text(`Error: ${result.status} ${result.statusText}`);
		} else {
			let res = await result.json();
			
			if (res.error) {
				document.getElementById('error-tracker').innerHTML = res.error;
			} else {
				if (res.correct) {
					// apply new state
					state = res.state.split("@");
					for (var v = 0; v < NUM_PUZZLES; v++) {
						if (state[v].length > 0) {
							document.getElementById('content-' + (v + 1)).style.display = 'none';
							document.getElementById('sol-' + (v + 1)).innerHTML = state[v];
						} else {
							document.getElementById('content-' + (v + 1)).style.display = '';
							document.getElementById('checker-' + (v + 1)).value = '';
							document.getElementById('sol-' + (v + 1)).innerHTML = '';
						}
					}
					document.getElementById('count').innerHTML = res.solves;
					if (res.solves == NUM_PUZZLES) {
						for (var i = 1; i <= NUM_PUZZLES; i++) {
							document.getElementById('main-block-' + i).style.display = 'none';
							document.getElementById('main-block-' + i).class = 'no-copy';
						}
						document.getElementById('meta').innerHTML = res.mtxt; // write in meta text				
						document.getElementById('blob').src = '../static/puzzle_resources/the-minimeta-that-goes-wrong/blobcheer.png';
						document.getElementById('patter').innerHTML = "Yay, you've solved all the feeder puzzles! ...I think. Well, at least the meta will be fine, right??";
					} else if (res.solves > 0) {
						document.getElementById('blob').src = '../static/puzzle_resources/the-minimeta-that-goes-wrong/blobsweat.png';
						document.getElementById('patter').innerHTML = "Wait, what's happening with the solves?";
					}					
				} else {
					document.getElementById('checker-' + n).value = '';
					document.getElementById('checker-' + n).placeholder = 'Incorrect!';
				}
			}
		}
	} catch (e) {
		$('#output').text(`Error: ${e}`);
	}
}

// https://docs.djangoproject.com/en/dev/ref/csrf/#ajax
function getCookie(name) {
	var cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			var cookie = cookies[i].trim();
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}


window.onload = function() {
	for (var i = 1; i <= NUM_PUZZLES; i++) {
		const checkerbox = document.getElementById("checker-" + i);
		const validate_button = document.getElementById("validate-" + i);
		checkerbox.addEventListener("keyup", function(event) {
			if (event.keyCode === 13) {
				event.preventDefault();
				validate_button.click();
			}
		});
	}
}