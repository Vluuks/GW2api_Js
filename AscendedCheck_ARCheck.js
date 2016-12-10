// declare variables


// api verficiation
var userapi;
var apistatus;

// equipment status
var characterarray;
var equipmentobject;
var itemobject;
var ascendedcheckarray;
var ascendedweaponcheckarray;
var gearcheck;

// dictionaries
var equipmentdictionary = {};
var ascendedweapondictionary = {};
var charinfodictionary = {};
var agedictionary = {};
var classdictionary = {};
var itemnamedictionary = {};
var weaponnamedictionary = {}
var agonycountdictionary = {}

// agony resist counting
var agonycount;
var weaponset1agonycount;
var weaponset2agonycount;
var weaponagonycount;



// obtain user's API code from input field on website and check if it is valid
function getuserapi(){
	
	// obtain API key from input field and trim if necessary
	document.getElementById("report").innerHTML = " "
	var x = document.getElementById("apiform");
    var text = "";
    var i;
    for (i = 0; i < x.length ;i++) {
        text += x.elements[i].value;
    }
	userapi = text.trim();
	console.log(userapi);
	
	// perform ajax request with given API key
	$.ajax({
		type: "GET",
		async: false,
		url: "https://api.guildwars2.com/v2/tokeninfo?access_token=" + userapi,
		cache: false,
		dataType: 'text',
		
			success: function (){},
			error: function(){},
			
			// wait until request is done
			complete: function(data){
						
				// parse json object
				var apiresult = JSON.parse(data.responseText);

				// if API unvalid
				if(apiresult.text == "endpoint requires authentication")
					apistatus = false;
				
				// check which permissions have been granted
				var apipermissions = 0;	
				for(m = 0; m < apiresult.permissions.length; m++){
					
					switch(apiresult.permissions[m]){
						
						case "account":
							apipermissions++;
							break;
						case "characters":
							apipermissions++;
							break;
						case "builds":
							apipermissions++;
							break;
					}
				}
				
				// if there are not enough permissions
				if(apipermissions != 3)
					apistatus = false;
				// if there are enough permissions (account, characters, builds)
				if (apipermissions == 3)
					apistatus = true;
			}    
	});
	
	
	// report to user whether API key provided is valid or not
	if(apistatus == false)
		document.getElementById("loading").innerHTML = "Your API key is either invalid or missing permissions to view character equipment, builds and info.";
	if(apistatus == true){
		document.getElementById("loading").innerHTML = "Retrieving info from API. This might take a while: my javascript is not that good yet. =(";
		fetchcharacters(userapi);
	}
}


// request API for array of characters on account
function fetchcharacters(userapi){
	
	$.ajax({
		type: "GET",
		async: false,
		url: "https://api.guildwars2.com/v2/characters?access_token=" + userapi,
		cache: false,
		dataType: 'text',
		
			success: function testfunctie(){},
			error: function(){},
			
			// wait until json request is done
			complete: function(data){
						console.log(" fetching character info complete");
						
				// convert json array to javascript array
				characterarray = JSON.parse(data.responseText);
				console.log(characterarray);
				console.log(characterarray.length);
				
				// start fetching equipment
				fetchequipment(characterarray, userapi);
			}    
	});
}


// fetch class, age, and level of character
function fetchcharinfo(a_characterarray, userapi){
	
	for (l = 0; l < a_characterarray.length; l++) { //TODO

        // create url to fetch information from
        var characterurl = "https://api.guildwars2.com/v2/characters/" + a_characterarray[l] + "?access_token=" + userapi; 
        
		// use this url for ajax request
        $.ajax({
            type: "GET",
            async: false,
            url: characterurl,
            cache: false,
            dataType: 'text',
            
				success: function testfunctie(){},
				error: function(){},
				
				// wait until request is done
				complete: function(data){
							
					// convert json data to javascript
					var characterobject = JSON.parse(data.responseText);
					
					// store character info and character age in dictionary
					charinfodictionary[a_characterarray[l]] = characterobject.level + " " + characterobject.race; 
					classdictionary[a_characterarray[l]] = characterobject.profession;
					agedictionary[a_characterarray[l]] = (characterobject.age / 3600).toFixed(0);
            }
        });
    }
}


// request information about character equipment
function fetchequipment(a_characterarray, userapi){

    // loops over character names in character array
    // requests equipment json object for every character
    // a_characterarray.length
    for (i = 0; i < 3 ; i++) {

        // create url character equipment
        var equipurl = "https://api.guildwars2.com/v2/characters/" + a_characterarray[i] + "/equipment?access_token=" + userapi;
        console.log(equipurl);
        
        // perform ajax request on url
        $.ajax({
            type: "GET",
            async: false, // anders dan klopt de loop niet meer?
            url: equipurl,
            cache: false,
            dataType: 'text',
            
				success: function testfunctie(){
					console.log(i); 
				},
				error: function(){},
				
				// wacht tot request klaar is en gebruik data
				complete: function(data){
							
					// zet json array om naar echt js array
					equipmentobject = JSON.parse(data.responseText);
					
					// maak dictionary entry aan op basis van character naam, voor elke character. Als het goed is heb ik dan 27 entries.
					equipmentdictionary[a_characterarray[i]] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // size 12, want 12 equipment pieces
					ascendedweapondictionary[a_characterarray[i]] = [0, 0, 0, 0];
					
					// check de armor op basis van de net verkregen equipment object van de character
					fetchcharinfo(a_characterarray, userapi);
					checkequipment(equipmentobject, a_characterarray[i], userapi);
					
            }
        });
    }
}

// checks whether character equipment is of ascended rarity
function checkequipment(an_equipmentobject, charactername, userapi){
    
	// initialize en reset gear
	ascendedcheckarray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	ascendedweaponcheckarray = [0, 0, 0, 0];
	agonycount = 0;
	weaponagonycount = 0;
	weaponset1agonycount = 0;
	weaponset2agonycount = 0;
	itemnamedictionary[charactername] = [];
	weaponnamedictionary[charactername] = [];

    // loop over the equipment object, voor elke equipment slot, voer een check uit
    for(var j = 0; j < an_equipmentobject.equipment.length; j++){
    	
    	console.log("loop ingegaan check per piece")
        
        switch(an_equipmentobject.equipment[j].slot){
	
			// armor
			case "Coat":
				var coat = an_equipmentobject.equipment[j].id;
				checkascended(coat, "Coat", charactername);
				countarmoragony(an_equipmentobject.equipment[j].infusions, charactername);
				break;
			case "Helm":
				var helm = an_equipmentobject.equipment[j].id;
				checkascended(helm, "Helm", charactername);
				countarmoragony(an_equipmentobject.equipment[j].infusions, charactername);
				break;		
			case "Shoulders":
				var shoulders = an_equipmentobject.equipment[j].id;
				checkascended(shoulders, "Shoulders", charactername);
				countarmoragony(an_equipmentobject.equipment[j].infusions, charactername);
				break;
			case "Gloves":
		        var gloves = an_equipmentobject.equipment[j].id;
				checkascended(gloves, "Gloves", charactername);
				countarmoragony(an_equipmentobject.equipment[j].infusions, charactername);
				break;
			case "Leggings":
				var leggings = an_equipmentobject.equipment[j].id;
				checkascended(leggings, "Leggings", charactername);
				countarmoragony(an_equipmentobject.equipment[j].infusions, charactername);
				break;
			case "Boots":
				var boots = an_equipmentobject.equipment[j].id;
				checkascended(boots, "Boots", charactername);
				countarmoragony(an_equipmentobject.equipment[j].infusions, charactername);
				break;
				
			// trinkets	
			case "Backpack":
				var backpiece = an_equipmentobject.equipment[j].id;
				checkascended(backpiece, "Backpack", charactername);
				countarmoragony(an_equipmentobject.equipment[j].infusions, charactername);
				break;
			case "Accessory1":
				var acc1 = an_equipmentobject.equipment[j].id;
				checkascended(acc1, "Accessory1", charactername);
				countarmoragony(an_equipmentobject.equipment[j].infusions, charactername);
				break;
			case "Accessory2":
				var acc2 = an_equipmentobject.equipment[j].id;
				checkascended(acc2, "Accessory2", charactername);
				countarmoragony(an_equipmentobject.equipment[j].infusions, charactername);
				break;
			case "Ring1":
				var ring1 = an_equipmentobject.equipment[j].id;
				checkascended(ring1, "Ring1", charactername);
				countarmoragony(an_equipmentobject.equipment[j].infusions, charactername);
				break;
			case "Ring2":
				var ring2 = an_equipmentobject.equipment[j].id;
				checkascended(ring2, "Ring2", charactername);
				countarmoragony(an_equipmentobject.equipment[j].infusions, charactername);
				break;
			case "Amulet":
				var amulet = an_equipmentobject.equipment[j].id;
				checkascended(amulet, "Amulet", charactername);
				countarmoragony(an_equipmentobject.equipment[j].infusions, charactername);
				break;
				
			// weapons
			case "WeaponA1":
				checkascended(an_equipmentobject.equipment[j].id, "WeaponA1", charactername);
				weaponset1agonycount += countweaponagony(an_equipmentobject.equipment[j].infusions);
				break;
			case "WeaponA2":
				checkascended(an_equipmentobject.equipment[j].id, "WeaponA2", charactername);
				weaponset1agonycount += countweaponagony(an_equipmentobject.equipment[j].infusions);
				break;
			
			case "WeaponB1":
				checkascended(an_equipmentobject.equipment[j].id, "WeaponB1", charactername);
				weaponset2agonycount += countweaponagony(an_equipmentobject.equipment[j].infusions);
				break;
			case "WeaponB2":
				checkascended(an_equipmentobject.equipment[j].id, "WeaponB2", charactername);
				weaponset2agonycount += countweaponagony(an_equipmentobject.equipment[j].infusions);
				break;
		}

	} // einde for loop

	
	
	console.log("aa");
	
	
	console.log(weaponset1agonycount);
	console.log(weaponset2agonycount);
	
	// determine which weapon set to use for agony resist calculation TODO bugged!!
	if(weaponset1agonycount > weaponset2agonycount){
		agonycountdictionary[charactername] += weaponset1agonycount;
		console.log(" 1>2")
	}
	else if(weaponset1agonycount < weaponset2agonycount){
		agonycountdictionary[charactername] += weaponset2agonycount;
		console.log(" 2>1")
	}
	else if(weaponset1agonycount == weaponset2agonycount){
		agonycountdictionary[charactername] += weaponset1agonycount;
	}
		
	displayinfo(charactername);
}


// add items of ascended rarity to corresponding character so they can be displayed by name
function itemTypeSwitch(itemtype, charactername){
	
	switch (itemtype){
		case "Coat":	
			ascendedcheckarray[0] = 1;
			itemnamedictionary[charactername].push(itemobject.name);
			break;
		case "Helm":
			ascendedcheckarray[1] = 1;
			itemnamedictionary[charactername].push(itemobject.name);
			break;
		case "Shoulders":
			ascendedcheckarray[2] = 1;
			itemnamedictionary[charactername].push(itemobject.name);
			break;
		case "Gloves":
			ascendedcheckarray[3] = 1;
			itemnamedictionary[charactername].push(itemobject.name);
			break;
		case "Leggings":
			ascendedcheckarray[4] = 1;
			itemnamedictionary[charactername].push(itemobject.name);
			break;
		case "Boots":
			ascendedcheckarray[5] = 1;
			itemnamedictionary[charactername].push(itemobject.name);
			break;
		case "Backpack":
			ascendedcheckarray[6] = 1;
			itemnamedictionary[charactername].push(itemobject.name);
			break;
		case "Accessory1":
			ascendedcheckarray[7] = 1;
			itemnamedictionary[charactername].push(itemobject.name);
			break;
		case "Accessory2":
			ascendedcheckarray[8] = 1;
			itemnamedictionary[charactername].push(itemobject.name);
			break;
		case "Ring1":
			ascendedcheckarray[9] = 1;
			itemnamedictionary[charactername].push(itemobject.name);
			break;
		case "Ring2":
			ascendedcheckarray[10] = 1;
			itemnamedictionary[charactername].push(itemobject.name);
			break;
		case "Amulet":
			ascendedcheckarray[11] = 1;
			itemnamedictionary[charactername].push(itemobject.name);
			break;	
		case "WeaponA1":
			ascendedweaponcheckarray[0] = 1;
			weaponnamedictionary[charactername].push(itemobject.name);
			break;	
		case "WeaponA2":
			ascendedweaponcheckarray[1] = 1;
			weaponnamedictionary[charactername].push(itemobject.name);
			break;	
		case "WeaponB1":
			ascendedweaponcheckarray[2] = 1;
			weaponnamedictionary[charactername].push(itemobject.name);
			break;	
		case "WeaponB2":
			ascendedweaponcheckarray[3] = 1;
			weaponnamedictionary[charactername].push(itemobject.name);
			break;	
	}
	
}


// performs the actual check for ascended on the item
function checkascended(itemid, itemtype, charactername){
    
    console.log(charactername + itemid + itemtype);
	// maak url voor specifiek item en maak dictionary entry met leeg array aan voor character
    var itemurl = "https://api.guildwars2.com/v2/items?id=" + itemid;
	        
	        // gebruik url voor ajax request
	        $.ajax({
	            type: "GET",
	            url: itemurl,
	            async: false,
	            cache: false,
	            dataType: 'text',
	            
				success: function(){},
				error: function(){},
				complete: function(data){
							
					// zet json array om naar js array
					itemobject = JSON.parse(data.responseText);
					
					switch(itemobject.rarity){
						case "Ascended":
							itemTypeSwitch(itemtype, charactername);
							break;
						case "Legendary":
							itemTypeSwitch(itemtype, charactername);
							break;
					}
					
					equipmentdictionary[charactername] = ascendedcheckarray;
					ascendedweapondictionary[charactername] = ascendedweaponcheckarray;
					
						
				}
        });
}


// count agony resist in weapons TODO rather redundant
function countweaponagony(infusionsarray){
	
	return countagony(infusionsarray);
}


// count agony resist in armor
function countarmoragony(infusionsarray, charactername){
	
	agonycountdictionary[charactername] = countagony(infusionsarray);
}


// checks infusions of ascended item and calculates AR in the item
function countagony(infusionsarray){
	
		if(infusionsarray != undefined){
		
		for(var n = 0; n < infusionsarray.length; n++){
		
			switch(infusionsarray[n]){
				
				// moto infusions
				case 78028:
					agonycount += 9;
					break;
				case 78052:
					agonycount += 9;
					break;
					
					
				// TODO add ghostly infusions (multiple stats!!)	
				
				// versatile simple infusions TODO add 3
				case 37138:
					agonycount += 5;
					break;
				case 70852:
					agonycount += 7;
					break;
				
				
				// regular infusions
				case 49424:
					agonycount += 1;
					break;
				case 49425:
					agonycount += 2;
					break;
				case 49426:
					agonycount += 3;
					break;
				case 49427:
					agonycount += 4;
					break;
				case 49428:
					agonycount += 5;
					break;
				case 49429:
					agonycount += 6;
					break;
				case 49430:
					agonycount += 7;
					break;
				case 49431:
					agonycount += 8;
					break;	
				case 49432:
					agonycount += 9;
					break;
				case 49433:
					agonycount += 10;
					break;
				case 49434:
					agonycount += 11;
					break;
				case 49435:
					agonycount += 12;
					break;
				case 49436:
					agonycount += 13;
					break;
				case 49437:
					agonycount += 14;
					break;
				case 49438:
					agonycount += 15;
					break;
				case 49439:
					agonycount += 16;
					break;
				case 49440:
					agonycount += 17;
					break;
				case 49441:
					agonycount += 18;
					break;
				case 49442:
					agonycount += 19;
					break;
				case 49443:
					agonycount += 20;
					break;
			}
		}
	}
	
	console.log(agonycount);
	return agonycount;
}


// determine how the class color should be displayed
function determinecolor(characterclass){
	
	var classname;
	
	switch(characterclass){
		
		case "Necromancer":
			classname = "green"
			break;
		case "Ranger":
			classname = "lightgreen"
			break;
		case "Thief":
			classname = "gray"
			break;
		case "Elementalist":
			classname = "red"
			break;
		case "Mesmer":
			classname = "purple"
			break;
		case "Engineer":
			classname = "orange"
			break;
		case "Guardian":
			classname = "blue"
			break;
		case "Revenant":
			classname = "redgrey"
			break;
		case "Warrior":
			classname = "yellow"
			break;
	}

	return classname;
}


// makes a displayable list of the ascended items
function displayitemnames(charactername){
	
	var itemlist = " ";
	
	for(var m=0; m < itemnamedictionary[charactername].length; m++){
		
		itemlist += m+1 +". " + itemnamedictionary[charactername][m] + "<br>";
	}
	
	for (var q=0; q < 12-itemnamedictionary[charactername].length; q++){
		itemlist += "<br>";
	}
	
	itemlist += "<br>-----------------------------<br>";
	
	itemlist += "<br>";
	
	for(var p=0; p < weaponnamedictionary[charactername].length; p++){
		
		itemlist += p+1 +". " + weaponnamedictionary[charactername][p] + "<br>";
	}
	
	for (var q=0; q < 4-weaponnamedictionary[charactername].length; q++){
		itemlist += "<br>";
	}
	
	return itemlist;
}


// display general info on character and agony resist count
function displayinfo(charactername){
	
	
	var ascendedstatus = equipmentdictionary[charactername];
	var ascendedcounter = 0;
	
	for(var k=0; k < ascendedstatus.length; k++){
		
		if(ascendedstatus[k] == 1)
			ascendedcounter++;
	}
	
	var ascendedweaponstatus = ascendedweapondictionary[charactername];
	var ascendedweaponcounter = 0;
	
	for(var o=0; o < ascendedweaponstatus.length; o++){
		
		if(ascendedweaponstatus[o] == 1)
			ascendedweaponcounter++;
	}
	
	
	// this part is terrible but well, time
	document.getElementById("report").innerHTML += 
	( "<p class=charname>"  + charactername + "</p>" 
	+ "<p class=" + determinecolor(classdictionary[charactername]) + "> " + classdictionary[charactername] + "</p>" 
	+ "<p class=charinfo>" + "Lvl " + charinfodictionary[charactername]) + " | " + agedictionary[charactername] + " hours played" + "</p><br>"
	+ "<p class=ascendedstat>" + ascendedcounter + "/12" + "</p>"
	+ "<p class=agonyresist>" + agonycountdictionary[charactername] + " Agony Resist" + "</p>"
	+ "<p class=itemlist>" + displayitemnames(charactername) + "</p>";
	
	document.getElementById("loading").innerHTML = "Done loading from API.";
}


