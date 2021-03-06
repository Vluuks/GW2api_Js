function generateCharacterForm(){
	
  // Get API from db/superglobal/html field with jquery
	var userapi = "F42B9440-82CB-0D4A-AA45-1594E292B1FB08137C88-69C5-4779-8740-43FA4C501EE0";

	$.ajax({
		type: "GET",
		async: false,
		url: "https://api.guildwars2.com/v2/characters?access_token=" + userapi,
		cache: false,
		dataType: 'text',
			success: function(){},
			error: function(){
				return false; // report back to user somehow that it went wrong
			},
			complete: function(data){
        makeList(JSON.parse(data.responseText));
			}    
	});
}

/* Generates the dropdown menu to choose a character */ 
function makeList(characterList){

	
	var selectMenu = $("<select id=\"selectId\" name=\"selectName\" onsubmit=\"checkCharacter()\"/>");
		
	for(var character in characterList) {
    $("<option />", {value: character, text: characterList[character]}).appendTo(selectMenu);
  }
	
  var button = $("<input id=\"button\" type=\"submit\" value=\"CONFIRM\">");
  
  selectMenu.appendTo("#form"); // Or whatever the ID of the div is :D
  button.appendTo("#form");
  
}


function validateCharacter(form){

	// Get chosen character from form
  var params = $("#form :selected").text(); 
	$("#chosen").text("You chose to raid with the character " + params);

	// Redirect to PHP with AJAX
	$.ajax({
        type: "POST",
        url: "somephpfile.php",
        data: params, //will be in post superglobal array as per usual
        success: function(result) {
				// update div with list of characters, or do something else
        //$("#htmlid").text(result);
        }
    });
}
