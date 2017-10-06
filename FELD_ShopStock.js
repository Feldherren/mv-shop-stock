/*:
 * @plugindesc Implements limited stock for shops.
 * @author Feldherren
 * @help Shop Stock v1.0.0, by Feldherren (rpaliwoda AT googlemail.com)
 
Changelog:
1.0: initial release
 
Plugin commands:
open_shop [shop]
close_shop
set_stock [shop] [item/weapon/armor] [id] [amount]
Sets the specified item's stock in the specified shop to the provided amount.
change_stock [shop] [item/weapon/armor] [id] [amount]
Adds the specified amount of stock to the specified item. If the value provided is negative, this will subtract stock from the shop (stopping at 0?)

Free for use with commercial projects, though I'd appreciate being
contacted if you do use it in any games, just to know.
 */ 
(function(){
	var parameters = PluginManager.parameters('FELD_ShopStock');
	
	var currentShop = null;
	
	var shopStock = Object();

	var FELD_ShopStock_aliasPluginCommand = Game_Interpreter.prototype.pluginCommand;
	
	Game_Interpreter.prototype.pluginCommand = function(command, args)
	{
		FELD_ShopStock_aliasPluginCommand.call(this,command,args);
		if(command == "open_shop" && args[0] != null)
		{
			trackingLabel = args[0];
		}
		else if(command == "close_shop" && args[0] != null)
		{
			trackingLabel = null;
		}
		else if(command == "set_stock" && args[0] != null && args[1] != null && args[2] != null && args[3] != null)
		{
			if (!(args[0] in shopStock))
			{
				shopStock[args[0]] = Object();
				shopStock[args[0]]['itemStock'] = Object();
				shopStock[args[0]]['weaponStock'] = Object();
				shopStock[args[0]]['armorStock'] = Object();
				shopStock[args[0]]['itemBaseStock'] = Object();
				shopStock[args[0]]['weaponBaseStock'] = Object();
				shopStock[args[0]]['armorBaseStock'] = Object();
			}
			// TODO: make sure args[1] is 'item', 'weapon' or 'armor' exactly
			// keep track of original stock with second object (for each of items, weapons, armor) storing original stock amount?
			shopStock[args[0]][args[1]+'Stock'][args[2]] = parseInt(args[3]);
			shopStock[args[0]][args[1]+'BaseStock'][args[2]] = parseInt(args[3]);
		}
		else if(command == "change_stock" && args[0] != null && args[1] != null && args[2] != null && args[3] != null)
		{
			if (!(args[0] in shopStock))
			{
				shopStock[args[0]] = Object();
				shopStock[args[0]]['items'] = Object();
				shopStock[args[0]]['weapons'] = Object();
				shopStock[args[0]]['armor'] = Object();
				shopStock[args[0]]['itemBaseStock'] = Object();
				shopStock[args[0]]['weaponBaseStock'] = Object();
				shopStock[args[0]]['armorBaseStock'] = Object();
			}
			// TODO: make sure args[1] is 'item', 'weapon' or 'armor' exactly
			shopStock[args[0]][args[0]+'Stock'][args[2]] = parseInt(args[3]);
		}
	}
})();