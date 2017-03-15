/* Renske Talsma
	10896503
	
	A complete clusterfuck
	
*/


// get api
// verify api
// get data in steps
// show data in steps
// ????
// profit



/* Model "class" used to store data about characters. Initializes with default
values and is further filled in as API requests are completed and data retrieved. */
function Character() {
      this.name = "";
      this.race = "";
      this.agonyResist = -1;
      this.profession = "";
      this.level = -1;
      this.equipment = [];
      this.equipmentRarity = [];
}

/* A global object used to store all the information pertaining to the account
that is currently using the visualization. */
var account = {
    
    apiKey: "",
    hoursPlayed: -1,
    characters: [],
    characterAmount: -1,
    fractalLevel: -1,
    fractalRelics: -1,
    fractalPristine: -1,
    characterDictionary: {}

    // if i have time
    // matrices
    // integrated matrices
    // fractal specific collections
    
}

/* Wait until page is ready. */
$('document').ready(function(){
	console.log("page ready");
});

/* Small function that takes a string and shows it in the error span on top of the page. */
function showError(errorMessage){
    $('#error').text(errorMessage);
}

/* Initializes the different svg canvases used by this visualization. */
function initCanvases(){
	// TODO
}


/* Check the given API and then start retrieving data if it has been verified. 
This function is invoked by pressing the button on the webpage. */
function getUserApi(){

    // Check for basics
    var apiKey = $("#apiKey").val().trim();
	console.log(apiKey);
	apiKey = "F42B9440-82CB-0D4A-AA45-1594E292B1FB08137C88-69C5-4779-8740-43FA4C501EE0"
    
    if(apiKey == "" || apiKey == undefined)
    {
    	showError("Please do not omit the field");
    }
    else{
        
        if (/^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{20}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/.test(apiKey)){

			$.ajax({
			type: "GET",
			async: true,
			url: "https://api.guildwars2.com/v2/tokeninfo?access_token=" + apiKey,
			cache: false,
			dataType: 'text',
			
				success: function (){},
				error: function(){
                    showError("Could not retrieve data about API from the server.");
				},
				// Check if it's a valid key even if it passed regex
				complete: function(data){

					var apiResult = JSON.parse(data.responseText);
					console.log(apiResult);
					
					// If the key matches the expected format but is still invalid
					if(apiResult.text && (apiResult.text.equals("endpoint requires authentication") || apiResult.text.equals("invalid key")))
						showError("Your API key is not valid or is missing permissions.");
				
					// If the permissions array exists in JSON
					if(apiResult.permissions){
						
						var permissionCount = 0;
						for(var i = 0; i <apiResult.permissions.length; i++){
							
							// Check for the necessary permissions
							// Possible permissions can be found at https://wiki.guildwars2.com/wiki/API:2/tokeninfo
							switch(apiResult.permissions[i]){
								case "characters":
									permissionCount++;
									break;
								case "account":
									permissionCount++;
									break;
								case "builds":
									permissionCount++;
									break;
								case "progression":
									permissionCount++;
									break;
							}
						}

						// Check if permission requirements were met, if so, invoke callback function.
						if(permissionCount == 4)
							apiCheckCallback(apiKey);
						else
							showError("Your API key is missing permissions.");
					}
				}    
			});
		}
        
		// If API key didn't pass regex it can never be valid.
		else{
			showError("Your API key is not valid");
		}
    }
}

/* Called after the API key has been verified and handles the subsequent calls to other functions
which retrieve more information from the API. */
function apiCheckCallback(apiKey){
    
    // Make api global now that it has been verified.
    account.apiKey = apiKey;
	
	// Get characters and in turn character equipment.
    getCharacters(getGeneralCharacterInfo);
    
	// Retrieve the fractal achievements and perform display cb.
	//getFractalAchievements(displayFractalAchievements);

    
    // Figure out which things can be done simultaneously and which are callback dependent
    
    // 1
    // Look up characters -> look up gear per character -> calculate agony resist
    
    // Construct barchart of AR per character
    // Show class also
    // Make character object!!!
    
    
    // 2
    // Look up fractal achievements
    // Find indices taht correspond
    // Report status
    
    
    //3
    // Look up fractal dailies and status (perhaps this can be done in same time with the other achievements)
    
}

/* This function retrieves a list of the characters on the account from the API and then
calls the callback which will retrieve additional info based on the character names. */
function getCharacters(callback){
 
    $.ajax({
		type: "GET",
		async: true,
		url: "https://api.guildwars2.com/v2/characters?access_token=" + account.apiKey,
		cache: false,
		dataType: 'text',
		
			success: function(){},
			error: function(){
                showError("Could not retrieve character data.");
            },
			complete: function(data){
						
				// Convert json array to javascript.
				characterArray = JSON.parse(data.responseText);
				console.log(characterArray);
				// console.log(characterArray.length);
                
                account.characters = characterArray.sort();
                account.characterAmount = characterArray.length;
				
				// Fetch general info and equipment.
                callback();
			}    
	}); 
}

/* Retrieves information about a character based on the name of the character and
stores the information in a character object which will be globally accessible by the
other functions in the script. */
function getGeneralCharacterInfo(){
  
    var characterArray = account.characters;
    var counter = 0;
    // ??? ?? ?? AAAAAAH
    
    for (let i = 0; i < account.characterAmount; i++) { 
        (function(i){
        
            $.ajax({
                type: "GET",
                async: true,
                url: "https://api.guildwars2.com/v2/characters/" + characterArray[i] + "?access_token=" + account.apiKey,
                cache: false,
                dataType: 'text',               
                success: function(){},
                error: function(){},
                
                // wait until request is done
                complete: function(data){
                            
                    // convert json data to javascript
                    var characterObject = JSON.parse(data.responseText);
                    counter++;
                    // console.log("loop index " + i);
                    // console.log("counter" + counter);
                    // console.log(characterObject);
                    
                    // Add properties to the object
                    var character = new Character();
                    character.race = characterObject.race;
                    character.level = characterObject.level;
                    character.equipment = characterObject.equipment;
                    character.profession = characterObject.profession;
                    character.hoursPlayed = (characterObject.age / 3600).toFixed(0);
                    account.characterDictionary[characterObject.name] = character;
                    
                    if(counter == characterArray.length){
                        console.log("CALLBACKS WTF NEE HELP loop test" + counter);   
                        fetchEquipment();
                    }
                }
            });
        })(i);
    }
}

/* This function extracts the equipment array from the dictionary of characters and their info
and checks for every piece what type it is and whether it is of ascended (best in slot) rarity. Because
this information is nested within the API, multiple API calls are necessary, we need to retrieve information
about the item using the item ID. This needs to be done with iterations because items are not always
present on a character (ie not all equipment slots are filled) so there are no fixed indices to use.

For every item we look up the rarity and the type and this is stored in an object which in turn is stored
in the dictionary with the character name as a key. This dictionary is globally accessible and will, after
the callback, be available for use by the visualizations. */
function fetchEquipment(){
   
   // Iterate over the characters in the dictionary and access equipment array for each.
    for (let character in account.characterDictionary) {
        (function(character){
            if (account.characterDictionary.hasOwnProperty(character)) {
                
                var equipmentArray = account.characterDictionary[character].equipment;
                var agonyResistCounter = 0;
                var gearCheckCounter = 0;
                
                // Loop over the equipment array and perform check on each piece that is present.
                for(let i = 0; i < equipmentArray.length; i++){
                    (function(i){
                         
                        // Request API for item rarity and type using the item id.
                        $.ajax({
                            type: "GET",
                            url: "https://api.guildwars2.com/v2/items?id=" + equipmentArray[i].id,
                            async: true,
                            cache: false,
                            dataType: 'text',
                            
                            success: function(){},
                            error: function(){},
                            complete: function(data){
                                itemObject = JSON.parse(data.responseText);
                                
                                // Store item properties in object and store object in the array of items on the character
                                if(itemObject.type == ("Armor") || itemObject.type == ("Trinket") || itemObject.type == ("Weapon") || itemObject.type == ("Back") ){
                                    var itemObject = {
                                        name: itemObject.name,
                                        rarity: itemObject.rarity,
                                        agonyResist: calculateAgonyResist(equipmentArray[i].infusions),
                                        type: itemObject.type,
                                        slot: equipmentArray[i].slot
                                    }
                                    
                                    // Push to equipment array. 
                                    account.characterDictionary[character].equipmentRarity.push(itemObject);
                                    
                                    // Calculate agony resist on this item. Weapons get special treatment due to two possible sets. 
                                    if(itemObject.type == "Weapon")
                                        agonyResistCounter += calculateAgonyResist(equipmentArray[i].infusions, 1);
                                    else
                                        agonyResistCounter += calculateAgonyResist(equipmentArray[i].infusions, 0);
                                    
                                }   
                                
                                // Increase counter for callback
                                gearCheckCounter++;
                                console.log("counter" + gearCheckCounter + "/" + (equipmentArray.length)-1 +"|| name " + character);
                                console.log("is lastchar " + character == account.characters[account.characterAmount-1]);
                                console.log("is last gear" + gearCheckCounter == equipmentArray.length-1);

                                // If it's the last character and the last equipment piece of that character, then we can go on!    
                                if(character == account.characters[account.characterAmount-1]
                                && gearCheckCounter == (equipmentArray.length)-1){
                                    console.log("CHECK CHECK DUBBELCHECK all done callback ready jeuj");
                                    onDataReady();
                                }
                            
                            }
                        });              
                    })(i);
                }
                
                // Add total agony resist to data.
                // TODO make distinction between weapon sets
                account.characterDictionary[character].agonyResist = agonyResistCounter;
            }
        }(character));
    }    
}


function onDataReady(){
    
    console.log(account.characterDictionary);
    
    for(character in account.characterDictionary){
        console.log(account.characterDictionary[character].equipmentRarity);
        console.log(account.characterDictionary[character].agonyResist);
    }
    
    
}


/* For a given armor piece, calculate the agony infusions present, and based on the ID of these
infusions return the total amount of agony resist present in the armor piece, trinket or weapon. 
There are many different infusions in this game due to ArenaNet's inconsistent additions and 
revamps of the system, which makes switches necessary to account for all possible types. 
If no infusions are present the infusionsarray will not exist and the function will return 0. */
function calculateAgonyResist(infusionsArray){
    
    
    
    var agonyResist = 0;
    if(infusionsArray != undefined){
		
		for(var i = 0; i < infusionsArray.length; i++){
		
			switch(infusionsArray[i]){
				
				// Special infusions (aura)
				case 78028:
					agonyResist += 9;
					break;
				case 78052:
					agonyResist += 9;
					break;
					
				// TODO add ghostly infusions (multiple stats!!)	
                // koda's warmth
                // and other shit
                // why
				
                // DICTIONARY VAN MAKEN TODO
                
                
				// Versatile simple infusions TODO add 3
				case 37138:
					agonyResist += 5;
					break;
				case 70852:
					agonyResist += 7;
					break;
				
				// Regular infusions.
				case 49424:
					agonyResist += 1;
					break;
				case 49425:
					agonyResist += 2;
					break;
				case 49426:
					agonyResist += 3;
					break;
				case 49427:
					agonyResist += 4;
					break;
				case 49428:
					agonyResist += 5;
					break;
				case 49429:
					agonyResist += 6;
					break;
				case 49430:
					agonyResist += 7;
					break;
				case 49431:
					agonyResist += 8;
					break;	
				case 49432:
					agonyResist += 9;
					break;
				case 49433:
					agonyResist += 10;
					break;
				case 49434:
					agonyResist += 11;
					break;
				case 49435:
					agonyResist += 12;
					break;
				case 49436:
					agonyResist += 13;
					break;
				case 49437:
					agonyResist += 14;
					break;
				case 49438:
					agonyResist += 15;
					break;
				case 49439:
					agonyResist += 16;
					break;
				case 49440:
					agonyResist += 17;
					break;
				case 49441:
					agonyResist += 18;
					break;
				case 49442:
					agonyResist += 19;
					break;
				case 49443:
					agonyResist += 20;
					break;
                    
                // Stat infusions
                // just fuck it
			}
		}
	}
    
    return agonyResist;
}








































/* ACHIEVEMENTS AND SUCH */
function getFractalAchievements(callback){
	
	// Get the array of API 
	$.ajax({
	type: "GET",
	async: true,
	url: "https://api.guildwars2.com/v2/account/achievements?access_token=" + account.apiKey,
	cache: false,
	dataType: 'text',
	
		success: function(){
		},
		error: function(){
			showError("Could not retrieve information about achievements.");
		},
		complete: function(data){
			
			var achievementArray = JSON.parse(data.responseText);
			var fractalAchievementArray = new Array(4);
			
			// Find the fractal achievements in the array (they do not have a fixed index, unfortunately).
			for(var i = 0, length = achievementArray.length; i < length; i++){
				switch(achievementArray[i].id){
					
					// Initiate
					case 2965:
						fractalAchievementArray[0] = achievementArray[i].bits;
						break;
						
					// Adept
					case 2894:
						fractalAchievementArray[1] = achievementArray[i].bits;
						break;
						
					// Expert
					case 2217:
						fractalAchievementArray[2] = achievementArray[i].bits;
						break;
					
					// Master
					case 2415:
						fractalAchievementArray[3] = achievementArray[i].bits;
						break;
				} 
			}
			
			console.log(fractalAchievementArray);
			callback(fractalAchievementArray);
		}
	});
}

function displayFractalAchievements(dataArray){
	
	console.log(dataArray);
	
	// Turn the array into a more useful/uniform data format.
	for(var i = 0; i < dataArray.length; i++){
		
		console.log(dataArray[i]);
		
		// Initialize an array full of true. 
		achievementBoolArray = new Array(25);
		for(var j = 0; j < achievementBoolArray.length; j++)
			achievementBoolArray[j] = true;
		
		// Set incomplete achievements to false for indices in subarrays.
		for (var k = 0; k < dataArray[i].length; k++){
			achievementBoolArray[dataArray[i][k]] = false;
		}
		
		dataArray[i] = achievementBoolArray;
	
	}
	
	console.log(dataArray);
	console.log("callback hoi");
	
	// Now I can do something with the data!
}