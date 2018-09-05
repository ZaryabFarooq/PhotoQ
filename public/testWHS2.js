
// A react component for a tag
class Tag extends React.Component {

	deleteTagDB(event, obj) {
		event.stopPropagation();
		console.log("onclick deletetag ", this.props.symbol);

		var reqIndices = this.props.text + "+" + this.props.idNum;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "/query?deleteTag=" + reqIndices); // We want more input sanitization than this!
		xhr.addEventListener("load", (evt) => {
			if (xhr.status == 200) {
				if(xhr.responseText == "error") {
					alert("There is an error, Reload");
				}
				else {
					this.props.onClick(xhr.responseText);
				}
			} else {
				console.log("XHR Error!", xhr.responseText);
			}
		} );
		xhr.send();
	}// deleteTag

	render () {
		return React.createElement('div', {className: 'tileTags'},
		React.createElement('p',  // type
		{ className: 'tagText'}, // properties
		this.props.text),
		React.createElement('p',  // type
		{ className: 'deletButton', onClick: this.deleteTagDB.bind(this)}, // properties
		this.props.symbol));  // contents
	}
};

class inputTag extends React.Component {

	constructor(props){
		super(props);
		this.state = {inputValue: ""};
	}

	addTagDB(event, obj) {
		event.stopPropagation();
		var newTagValue = this.state.inputValue;
		console.log("onclick add tags -->>>>>>>", newTagValue);
		this.state.inputValue = "";
		var reqIndices = newTagValue + "+" + this.props.idNum;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "/query?addTag=" + reqIndices); // We want more input sanitization than this!
		xhr.addEventListener("load", (evt) => {
			if (xhr.status == 200) {
				if(xhr.responseText == "error") {
					alert("There is an error, Reload");
				}
				else {
					this.props.onClick(xhr.responseText);
				}
			} else {
				console.log("XHR Error!", xhr.responseText);
			}
		} );
		xhr.send();
	}// deleteTag

	inputOnclick(event, obj){
		//console.log("inputOnclick");
		event.stopPropagation();
	}

	updateInputValue(event){
		// console.log("update input ", event.target.value.length);

		this.setState({inputValue: event.target.value});
	}



	render () {
		return React.createElement('div',  // type
		{ className: 'tagText'}, // properties
		React.createElement('input',  // type
		{ className: "newTagInput", type: 'text',
		value: this.state.inputValue, onChange: this.updateInputValue.bind(this),
		autoFocus: true, onClick: this.inputOnclick}), // properties
		React.createElement('p',  // type
		{ className: 'addButton', onClick: this.addTagDB.bind(this)}, // properties
		this.props.symbol
	));  // contents
}
};


// A react component for controls on an image tile
class TileControl extends React.Component {

	constructor(props) {
		super(props);
		//console.log("props TileControl----> ", props);
		this.state = { allTags: this.props.tags, addClass: ""};
		this.deleteTag = this.deleteTag.bind(this);
	}

	deleteTag (tag) {
		console.log("deleteTag in TileControl", tag)
		this.setState({allTags: tag});
	}

	addTag (tag) {
		console.log("addTag in TileControl", tag)
		this.setState({allTags: tag});
	}

	deleteImage(event, obj) {
		event.stopPropagation();
		var reqIndices = this.props.idNum;
		var suggestedTags = document.getElementById("suggestionControls1").children;
		var allselectedTags = [];
		for(var i = 1; i < suggestedTags.length; i++ ){
			//reqIndices = reqIndices + "+" + suggestedTags[i].children[0].textContent;
			allselectedTags.push(suggestedTags[i].children[0].textContent);
		}
		console.log("test2 ",allselectedTags);
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "/query?deletImage=" + reqIndices); // We want more input sanitization than this!
		xhr.addEventListener("load", (evt) => {
			if (xhr.status == 200) {
				if(xhr.responseText == "error") {
					alert("There is an error, Reload");
				}
				else {
					updateImagesAgain(allselectedTags);
				}
			} else {
				console.log("XHR Error!", xhr.responseText);
			}
		} );
		xhr.send();
	}
	render () {
		// remember input vars in closure
		var _selected = this.props.selected;
		var _src = this.props.src;
		var _tags = this.props.tags;
		var _idNum = this.props.idNum;
		var _deleteTag = this.deleteTag.bind(this);
		var _addTag = this.addTag.bind(this);
		// parse image src for photo name
		var photoTags = this.state.allTags.split(",");
		//photoTags = photoTags.split('%20').join(' ');
		//console.log("test1 ",photoTags);
		var count = photoTags.length;

		if(count < 7){
			return ( React.createElement('div',
			{className: _selected ? 'selectedControls' : 'normalControls'},
			React.createElement('div', {className: 'floatRight' + this.state.addClass},
			React.createElement('p', {className: 'floatRightButton', onClick: this.deleteImage.bind(this)}, "x")),
			// div contents - so far only one tag
			React.createElement('div',{className: 'allTheTags'},
			photoTags.map(function(e) {
				//console.log("e ", e);
				return (
					React.createElement(Tag,
						{ text: e,
							symbol: "x",
							idNum: _idNum,
							onClick: _deleteTag})
						);
					}),
					React.createElement('div', {className: 'addTag ' + this.state.addClass},
					React.createElement(inputTag,
						{ symbol: "+",
						idNum: _idNum,
						onClick: _addTag}))
					)// createElement div
				)
				)// return
			}//if==6
			else{
				return ( React.createElement('div',
				{className: _selected ? 'selectedControls' : 'normalControls'},
				React.createElement('div', {className: 'floatRight' + this.state.addClass},
				React.createElement('p', {className: 'floatRightButton '}, "x")),
				React.createElement('div',{className: 'allTheTags'},
				// div contents - so far only one tag
				photoTags.map(function(e) {
					//console.log("e ", e);
					return (
						React.createElement(Tag,
							{ text: e,
								symbol: "x",
								idNum: _idNum,
								onClick: _deleteTag})
							);
						})
					)
					)// createElement div
				)
			}
		} // render
	};


	// A react component for an image tile
	class ImageTile extends React.Component {

		render() {
			// onClick function needs to remember these as a closure
			var _onClick = this.props.onClick;
			var _index = this.props.index;
			var _photo = this.props.photo;
			//console.log("phptp ", this.props);
			var _selected = _photo.selected; // this one is just for readability

			return (
				React.createElement('div',
				{style: {margin: this.props.margin, width: _photo.width},
				className: 'tile',
				onClick: function onClick(e) {
					console.log("tile onclick");
					// call Gallery's onclick
					return _onClick (e,
						{ index: _index, photo: _photo })
					}
				}, // end of props of div
				// contents of div - the Controls and an Image
				React.createElement(TileControl,
					{selected: _selected,
						src: _photo.src,
						tags: _photo.tags,
						idNum: _photo.idNum}),
						React.createElement('img',
						{className: _selected ? 'selected' : 'normal',
						src: _photo.src,
						width: _photo.width,
						height: _photo.height
					})
				)//createElement div
			); // return
		} // render
	} // class


	// The react component for the whole image gallery
	// Most of the code for this is in the included library
	class App extends React.Component {

		constructor(props) {
			super(props);
			//console.log("props----> ", props);
			this.state = { photos: [] };
			this.selectTile = this.selectTile.bind(this);
			this.columns = 2;
			this.wWidth = window.innerWidth;
			document.getElementById("suggestionOverlay").style.display = "none";
		}

		componentWillMount() {
			window.addEventListener('resize', this.sizeChange.bind(this));
		}

		sizeChange() {
			const winWidth = window.innerWidth;
			//console.log(this.wWidth);
			if(this.wWidth <= 620 && winWidth > 620){
				this.setState({columns: 2});
				document.getElementById("req-text").style.display = "inline-block";
				document.getElementById("logo").style.display = "inline-block";
			}
			else if(this.wWidth > 620 && winWidth <= 620){
				this.setState({columns: 1});
				document.getElementById("req-text").style.display = "none";
			}
			this.wWidth = winWidth;
		}

		selectTile(event, obj) {
			console.log("in onclick!", obj);
			let photos = this.state.photos;
			photos[obj.index].selected = !photos[obj.index].selected;
			this.setState({ photos: photos });
		}

		render() {
			return (
				React.createElement( Gallery, {photos: this.state.photos,
					onClick: this.selectTile,
					columns: this.state.columns,
					ImageComponent: ImageTile} )
				);
			}
		}

		/* Finally, we actually run some code */

		const reactContainer = document.getElementById("react");
		var reactApp = ReactDOM.render(React.createElement(App),reactContainer);

		/* Workaround for bug in gallery where it isn't properly arranged at init */
		window.dispatchEvent(new Event('resize'));

		function textOverlay(event) {
			const winWidth = window.innerWidth;
			if(event.id == "react"){
				document.getElementById("suggestionOverlay").style.display = "none";
			}
			else if(winWidth > 620){
				if(document.getElementById("suggestionOverlay").style.display == "none"){
					document.getElementById("overlay1").style.display = "none";
					document.getElementById("suggestionOverlay").style.display = "block";
				}
				// else {
				// 	document.getElementById("suggestionOverlay").style.display = "none";
				// }
			}
			if(winWidth <= 620){
				document.getElementById("suggestionOverlay").style.height = "100%";
			}
		}

		var autoCompObj = [];
		var selectedTags = [];
		function updateTextboxValue(event) {
			var reqIndices = document.getElementById("req-text").value;
			if((event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 32 || event.keyCode == 189 || event.keyCode == 190){
				/*space or a character, number, -, ., delete */
				reqIndices = reqIndices+ event.key;
			}

			if(event.keyCode == 8 ){
				reqIndices = reqIndices.slice(0,-1);
			}
			console.log("updateTextboxValue ", reqIndices);
			var suggestion = document.getElementById("suggestionTile");
			if(suggestion != null) {
				console.log("inside remove updateTextboxValue 1");
				suggestion.remove();
			}

			if(event.keyCode == 13){
				console.log("enter Key");
				document.getElementById("req-text").value = "";
				selectedTags.push(reqIndices);

				var selectedTagTile = document.getElementById("suggestionControls");
				if(selectedTagTile != null) {
					console.log("inside remove selectedTagTile");
					selectedTagTile.remove();
				}
				console.log("selected tags --> ", selectedTags)
				var textTileBox = document.createElement('div');
				textTileBox.id = "suggestionControls";
				for(var j =0; j<selectedTags.length; j++){

					var suggTag = document.createElement('div');
					var suggTagtext = document.createElement('p');
					var suggTagDelete = document.createElement('p');
					suggTag.classList.add("tileTagsSugg");
					suggTagtext.classList.add("tagText");
					suggTagDelete.classList.add("deletButton");
					suggTagtext.textContent = selectedTags[j];
					suggTagDelete.textContent = "x";
					suggTagDelete.onclick = function () {
						// console.log("delete suggestion button onclick",this.parentNode.children[0].textContent);
						var index = selectedTags.indexOf(this.parentNode.children[0].textContent);
						// console.log("delete - ",selectedTags, " ", index);
						selectedTags.splice(index,1);
						// console.log("delete - ",selectedTags);
						this.parentNode.remove();
						// selectedTags.indexOf()
					}

					suggTag.appendChild(suggTagtext);
					suggTag.appendChild(suggTagDelete);
					textTileBox.appendChild(suggTag);
				}
				suggestionOverlay.prepend(textTileBox);
			}
			else if(event.keyCode == 9){
				event.preventDefault();
				console.log("tab Key");
			}
			else{
				if(reqIndices.length == 2){
					console.log("inside length == 2");
					var xhr = new XMLHttpRequest();
					xhr.open("GET", "/query?autocomplete=" + reqIndices); // We want more input sanitization than this!
					xhr.addEventListener("load", (evt) => {
						if (xhr.status == 200) {
							if(xhr.responseText == "Bad Request") {
								alert("Bad Request");
							}
							else {

								autoCompObj = JSON.parse(xhr.responseText);
								if(autoCompObj == reqIndices) { // no match
									console.log("response ",autoCompObj);
									autoCompObj = null;
								}
								else{ //matched
									console.log("response match ",autoCompObj);
									// var suggOverlay = document.getElementById("suggestionOverlay");

									var textTileBox = document.createElement('div');
									textTileBox.id = "suggestionTile";
									var i = 0;
									for(i = 0; i < autoCompObj.length && i<7; i++){
										var suggTag = document.createElement('div');
										var suggTagtext = document.createElement('div');
										var suggTagArrow = document.createElement('div');
										suggTag.classList.add("suggTag");
										suggTagtext.classList.add("suggTagText");
										suggTagArrow.classList.add("suggTagButton");
										suggTagtext.textContent = autoCompObj[i];
										suggTagArrow.textContent = "\u2196";
										suggTagArrow.onclick = function () {
											console.log("suggestion button onclick");
											document.getElementById("req-text").value = "";
											reqIndices = this.parentNode.children[0].textContent;
											selectedTags.push(reqIndices);

											var selectedTagTile = document.getElementById("suggestionControls");
											if(selectedTagTile != null) {
												console.log("inside remove selectedTagTile");
												selectedTagTile.remove();
											}
											console.log("selected tags --> ", selectedTags)
											var textTileBox = document.createElement('div');
											textTileBox.id = "suggestionControls";
											for(var j =0; j<selectedTags.length; j++){

												var suggTag = document.createElement('div');
												var suggTagtext = document.createElement('p');
												var suggTagDelete = document.createElement('p');
												suggTag.classList.add("tileTagsSugg");
												suggTagtext.classList.add("tagText");
												suggTagDelete.classList.add("deletButton");
												suggTagtext.textContent = selectedTags[j];
												suggTagDelete.textContent = "x";
												suggTagDelete.onclick = function () {
													// console.log("delete suggestion button onclick",this.parentNode.children[0].textContent);
													var index = selectedTags.indexOf(this.parentNode.children[0].textContent);
													// console.log("delete - ",selectedTags, " ", index);
													selectedTags.splice(index,1);
													// console.log("delete - ",selectedTags);
													this.parentNode.remove();
													// selectedTags.indexOf()
												}

												suggTag.appendChild(suggTagtext);
												suggTag.appendChild(suggTagDelete);
												textTileBox.appendChild(suggTag);
											}
											suggestionOverlay.prepend(textTileBox);
											document.getElementById("req-text").value = "";
											updateTextboxValue(event);
										}
										suggTagtext.onclick = function () {
											console.log("suggestion button onclick");
											document.getElementById("req-text").value = "";
											reqIndices = this.parentNode.children[0].textContent;
											selectedTags.push(reqIndices);

											var selectedTagTile = document.getElementById("suggestionControls");
											if(selectedTagTile != null) {
												console.log("inside remove selectedTagTile");
												selectedTagTile.remove();
											}
											console.log("selected tags --> ", selectedTags)
											var textTileBox = document.createElement('div');
											textTileBox.id = "suggestionControls";
											for(var j =0; j<selectedTags.length; j++){

												var suggTag = document.createElement('div');
												var suggTagtext = document.createElement('p');
												var suggTagDelete = document.createElement('p');
												suggTag.classList.add("tileTagsSugg");
												suggTagtext.classList.add("tagText");
												suggTagDelete.classList.add("deletButton");
												suggTagtext.textContent = selectedTags[j];
												suggTagDelete.textContent = "x";
												suggTagDelete.onclick = function () {
													// console.log("delete suggestion button onclick",this.parentNode.children[0].textContent);
													var index = selectedTags.indexOf(this.parentNode.children[0].textContent);
													// console.log("delete - ",selectedTags, " ", index);
													selectedTags.splice(index,1);
													// console.log("delete - ",selectedTags);
													this.parentNode.remove();
													// selectedTags.indexOf()
												}

												suggTag.appendChild(suggTagtext);
												suggTag.appendChild(suggTagDelete);
												textTileBox.appendChild(suggTag);
											}
											suggestionOverlay.prepend(textTileBox);
											document.getElementById("req-text").value = "";
											updateTextboxValue(event);
										}

										suggTag.appendChild(suggTagtext);
										suggTag.appendChild(suggTagArrow);
										textTileBox.appendChild(suggTag);
									}
									var suggoverlay = document.getElementById("suggestionOverlay");
									var height = 150 + (i)*50 + "px";
									const winWidth = window.innerWidth;
									if(winWidth > 620){
										suggoverlay.style.height = height;
									}
									else suggoverlay.style.height = "100%";
									// console.log("height ",height);
									suggestionOverlay.append(textTileBox);

								}
							}
							//window.dispatchEvent(new Event('resize')); /* The world is held together with duct tape */
						} else {
							console.log("XHR Error!", xhr.responseText);
						}
					} );
					xhr.send();
				}
				else if(reqIndices.length < 2){
					console.log("inside length < 2");
					autoCompObj = [];
				}
				else{
					console.log("inside length > 2");
					var autoCompTags = [];
					if(autoCompObj != null){
					autoCompObj.map(e => {
						if(e.startsWith(reqIndices)){
							autoCompTags.push(e);
						}
					})

					var textTileBox = document.createElement('div');
					textTileBox.id = "suggestionTile";
					for(var i = 0; i < autoCompTags.length && i < 7; i++){
						var suggTag = document.createElement('div');
						var suggTagtext = document.createElement('div');
						var suggTagArrow = document.createElement('div');
						suggTag.classList.add("suggTag");
						suggTagtext.classList.add("suggTagText");
						suggTagArrow.classList.add("suggTagButton");
						suggTagtext.textContent = autoCompTags[i];
						suggTagArrow.textContent = "\u2196";
						suggTagArrow.onclick = function () {
							console.log("suggestion button onclick");
							document.getElementById("req-text").value = "";
							reqIndices = this.parentNode.children[0].textContent;
							selectedTags.push(reqIndices);

							var selectedTagTile = document.getElementById("suggestionControls");
							if(selectedTagTile != null) {
								console.log("inside remove selectedTagTile");
								selectedTagTile.remove();
							}
							console.log("selected tags --> ", selectedTags)
							var textTileBox = document.createElement('div');
							textTileBox.id = "suggestionControls";
							for(var j =0; j<selectedTags.length; j++){

								var suggTag = document.createElement('div');
								var suggTagtext = document.createElement('p');
								var suggTagDelete = document.createElement('p');
								suggTag.classList.add("tileTagsSugg");
								suggTagtext.classList.add("tagText");
								suggTagDelete.classList.add("deletButton");
								suggTagtext.textContent = selectedTags[j];
								suggTagDelete.textContent = "x";
								suggTagDelete.onclick = function () {
									// console.log("delete suggestion button onclick",this.parentNode.children[0].textContent);
									var index = selectedTags.indexOf(this.parentNode.children[0].textContent);
									// console.log("delete - ",selectedTags, " ", index);
									selectedTags.splice(index,1);
									// console.log("delete - ",selectedTags);
									this.parentNode.remove();
									// selectedTags.indexOf()
								}

								suggTag.appendChild(suggTagtext);
								suggTag.appendChild(suggTagDelete);
								textTileBox.appendChild(suggTag);
							}
							suggestionOverlay.prepend(textTileBox);
							updateTextboxValue(event);
						}
						suggTagtext.onclick = function () {
							console.log("suggestion button onclick");
							document.getElementById("req-text").value = "";
							reqIndices = this.parentNode.children[0].textContent;
							selectedTags.push(reqIndices);

							var selectedTagTile = document.getElementById("suggestionControls");
							if(selectedTagTile != null) {
								console.log("inside remove selectedTagTile");
								selectedTagTile.remove();
							}
							console.log("selected tags --> ", selectedTags)
							var textTileBox = document.createElement('div');
							textTileBox.id = "suggestionControls";
							for(var j =0; j<selectedTags.length; j++){

								var suggTag = document.createElement('div');
								var suggTagtext = document.createElement('p');
								var suggTagDelete = document.createElement('p');
								suggTag.classList.add("tileTagsSugg");
								suggTagtext.classList.add("tagText");
								suggTagDelete.classList.add("deletButton");
								suggTagtext.textContent = selectedTags[j];
								suggTagDelete.textContent = "x";
								suggTagDelete.onclick = function () {
									// console.log("delete suggestion button onclick",this.parentNode.children[0].textContent);
									var index = selectedTags.indexOf(this.parentNode.children[0].textContent);
									// console.log("delete - ",selectedTags, " ", index);
									selectedTags.splice(index,1);
									// console.log("delete - ",selectedTags);
									this.parentNode.remove();
									// selectedTags.indexOf()
								}

								suggTag.appendChild(suggTagtext);
								suggTag.appendChild(suggTagDelete);
								textTileBox.appendChild(suggTag);
							}
							suggestionOverlay.prepend(textTileBox);
							document.getElementById("req-text").value = "";
							updateTextboxValue(event);
						}

						suggTag.appendChild(suggTagtext);
						suggTag.appendChild(suggTagArrow);
						textTileBox.appendChild(suggTag);
					}
					var suggoverlay = document.getElementById("suggestionOverlay");
					var height = 150 + (i)*50 + "px";
					const winWidth = window.innerWidth;
					if(winWidth > 620){
						suggoverlay.style.height = height;
					}
					else suggoverlay.style.height = "100%";
					suggestionOverlay.append(textTileBox);
					console.log("autoComptags ",autoCompTags);
				}
			}

			}
		}



		function updateImages()
		{
			autoCompObj = [];
			// selectedTags = [];
			var selectedTagTile = document.getElementById("suggestionControls");
			if(selectedTagTile != null) {
				console.log("inside remove update image1");
				selectedTagTile.remove();
			}
			var selectedTagTile = document.getElementById("suggestionControls1");
			if(selectedTagTile != null) {
				console.log("inside remove update image1");
				selectedTagTile.remove();
			}
			var suggestion = document.getElementById("suggestionTile");
			console.log(suggestion);
			if(suggestion != null) {
				console.log("inside remove updateImages 2");
				suggestion.remove();
			}
			const winWidth = window.innerWidth;
			if(winWidth <= 620){

				if(document.getElementById("suggestionOverlay").style.display == "none"){
					document.getElementById("overlay1").style.display = "none";
					document.getElementById("suggestionOverlay").style.display = "block";
					document.getElementById("logo").style.display = "none";
					document.getElementById("req-text").style.display = "inline-block";
				}
				else {
					document.getElementById("suggestionOverlay").style.display = "none";
					document.getElementById("logo").style.display = "inline-block";
					document.getElementById("req-text").style.display = "none";
				}
					document.getElementById("suggestionOverlay").style.height = "100%";
			}

			else document.getElementById("suggestionOverlay").style.display = "none";

			var reqIndices = "";
			selectedTags.map(function(e) {
				reqIndices = reqIndices + "," + e;
			});
			console.log("rewu ",reqIndices);
			reqIndices = reqIndices.slice(1);

			if(reqIndices == "," || reqIndices == "") {
				console.log("empty");
				selectedTags = [];
				reactApp.setState({photos:[]});
			}
			else{
			// Add the selected tags list above the images
			var textTileBox = document.createElement('div');
			textTileBox.id = "suggestionControls1";
			var searchtext = document.createElement('div');
			searchtext.textContent = "You searched for  ";
			searchtext.classList.add("searchText");
			textTileBox.appendChild(searchtext);
			for(var j =0; j<selectedTags.length; j++){

				var suggTag = document.createElement('div');
				var suggTagtext = document.createElement('p');
				var suggTagDelete = document.createElement('p');
				suggTag.classList.add("tileTagsSuggSearched");
				suggTagtext.classList.add("tagText");
				suggTagDelete.classList.add("deletButton");
				suggTagtext.textContent = selectedTags[j];
				suggTagDelete.textContent = "x";
				suggTagDelete.onclick = function() {
					// console.log("delete suggestion button onclick ",selectedTags);
					selectedButtonOnclick(this);
				};

				suggTag.appendChild(suggTagtext);
				suggTag.appendChild(suggTagDelete);
				textTileBox.appendChild(suggTag);
			}

			function selectedButtonOnclick(evt) {
				console.log("delete suggestion button onclick ",evt.parentNode.parentNode.children.length);
				selectTagArray = [];
				if(evt.parentNode.parentNode.children.length == 2){
					evt.remove();
					console.log("array after delete leength ==2",selectTagArray);
					updateImagesAgain(selectTagArray);
				}
				else{

					var children = evt.parentNode.parentNode.children;
					for(var i = 1; i < children.length; i++ ){
						var textval = evt.parentNode.parentNode.children[i].children[0].textContent;
						console.log(textval);
						if(textval != evt.parentNode.children[0].textContent){
							selectTagArray.push(textval);
						}
					}
					evt.remove();
					console.log("array after delete ",selectTagArray);
					updateImagesAgain(selectTagArray);
				}
			}
			var reactElem = document.getElementById("react");
			reactElem.parentNode.insertBefore(textTileBox,reactElem);

			selectedTags = []; // clear the seleted tags now after adding to the querry
			document.getElementById("req-text").value = "";

			if (!reqIndices) return; // No query? Do nothing!

			var xhr = new XMLHttpRequest();
			xhr.open("GET", "/query?keyList=" + reqIndices.replace(/,/g, "+")); // We want more input sanitization than this!
			xhr.addEventListener("load", (evt) => {
				if (xhr.status == 200) {
					if(xhr.responseText == "Bad Request") {
						reactApp.setState({photos:[]});
						alert("Bad Request, Please try again between 0-988");
					}
					else {
						respObj = JSON.parse(xhr.responseText);
						if(respObj[0].message == "There were no photos satisfying this query."){
							var selectedTagTile = document.getElementById("suggestionControls1");
							if(selectedTagTile != null) {
								console.log("inside remove update image1");
								selectedTagTile.remove();
							}
							alert("There were no photos satisfying this query, Try Again");
						}
						if(winWidth <= 620){
							reactApp.setState({photos:respObj[1],columns:1});
						}
						else{
							reactApp.setState({photos:respObj[1], columns:2});
						}
					}
					window.dispatchEvent(new Event('resize')); /* The world is held together with duct tape */
				} else {
					console.log("XHR Error!", xhr.responseText);
				}
			} );
			xhr.send();
		}
		}

		function updateImagesAgain(selectedTagsArray)
		{
			var selectedTagTile = document.getElementById("suggestionControls1");
			if(selectedTagTile != null) {
				console.log("inside remove update image1");
				selectedTagTile.remove();
			}
			const winWidth = window.innerWidth;
			if(winWidth <= 620){

				if(document.getElementById("suggestionOverlay").style.display == "none"){
					document.getElementById("overlay1").style.display = "none";
					document.getElementById("suggestionOverlay").style.display = "none";
					document.getElementById("logo").style.display = "none";
					document.getElementById("req-text").style.display = "inline-block";
				}
				else {
					document.getElementById("suggestionOverlay").style.display = "none";
					document.getElementById("logo").style.display = "inline-block";
					document.getElementById("req-text").style.display = "none";
				}
			}
			else document.getElementById("suggestionOverlay").style.display = "none";

			// console.log("before null ",selectedTagsArray);
			if(selectedTagsArray.length == 0){
				reactApp.setState({photos:[]});
			}
			else{
			var reqIndices = selectedTagsArray.join(",");
			console.log("rewu ",reqIndices);

			// Add the selected tags list above the images
			var textTileBox = document.createElement('div');
			textTileBox.id = "suggestionControls1";
			var searchtext = document.createElement('div');
			searchtext.textContent = "You searched for  ";
			searchtext.classList.add("searchText");
			textTileBox.appendChild(searchtext);
			for(var j =0; j<selectedTagsArray.length; j++){

				var suggTag = document.createElement('div');
				var suggTagtext = document.createElement('p');
				var suggTagDelete = document.createElement('p');
				suggTag.classList.add("tileTagsSuggSearched");
				suggTagtext.classList.add("tagText");
				suggTagDelete.classList.add("deletButton");
				suggTagtext.textContent = selectedTagsArray[j];
				suggTagDelete.textContent = "x";
				suggTagDelete.onclick = function () {
					console.log("delete suggestion button onclick again ",this.parentNode.children[0].textContent);
					selectedButtonOnclick(this);
					// selectedTags.indexOf()
				}

				suggTag.appendChild(suggTagtext);
				suggTag.appendChild(suggTagDelete);
				textTileBox.appendChild(suggTag);
			}
			function selectedButtonOnclick(evt) {
				console.log("delete suggestion button onclick ",evt.parentNode.parentNode.children.length);
				selectTagArray = [];
				if(evt.parentNode.parentNode.children.length == 2){
					evt.remove();
					console.log("array after delete leength ==2",selectTagArray);
					updateImagesAgain(selectTagArray);
				}
				else{

					var children = evt.parentNode.parentNode.children;
					for(var i = 1; i < children.length; i++ ){
						var textval = evt.parentNode.parentNode.children[i].children[0].textContent;
						console.log(textval);
						if(textval != evt.parentNode.children[0].textContent){
							selectTagArray.push(textval);
						}
					}
					evt.remove();
					console.log("array after delete ",selectTagArray);
					updateImagesAgain(selectTagArray);
				}
			}

			var reactElem = document.getElementById("react");
			reactElem.parentNode.insertBefore(textTileBox,reactElem);

			document.getElementById("req-text").value = "";

			if (!reqIndices) return; // No query? Do nothing!

			var xhr = new XMLHttpRequest();
			xhr.open("GET", "/query?keyList=" + reqIndices.replace(/ |,/g, "+")); // We want more input sanitization than this!
			xhr.addEventListener("load", (evt) => {
				if (xhr.status == 200) {
					if(xhr.responseText == "Bad Request") {
						reactApp.setState({photos:[]});
						alert("Bad Request, Please try again between 0-988");
					}
					else {
						respObj = JSON.parse(xhr.responseText);
						if(winWidth <= 620){
							reactApp.setState({photos:respObj[1],columns:1});
						}
						else{
							reactApp.setState({photos:respObj[1], columns:2});
						}
					}
					window.dispatchEvent(new Event('resize')); /* The world is held together with duct tape */
				} else {
					console.log("XHR Error!", xhr.responseText);
				}
			} );
			xhr.send();
		}
		}
