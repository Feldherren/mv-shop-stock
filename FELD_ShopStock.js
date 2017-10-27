/*:
 * @plugindesc Implements limited stock for shops.
 * @author Feldherren
 * @help Shop Stock v1.0.0, by Feldherren (rpaliwoda AT googlemail.com)
 *
 * @param refreshAddsStock
 * @text Refreshing adds stock
 * @desc Sets the default refresh behaviour for shops; whether refreshing will add to current shop stock, or replace it.
 * @type boolean
 * @default false
 *
 * @param addStockOnSell
 * @text Selling adds stock
 * @desc Sets the default behaviour for shops when selling; whether shop stock increases when copies of items are sold to the shop.
 * @type boolean
 * @default true
 *
 * @help Item Stock v0.1.0, by Feldherren (rpaliwoda AT googlemail.com) 
 
Changelog:
0.2.0:	shops now have individual behaviours for whether refreshing adds or 
		replaces current stock, and whether stock is added to the shop when
		selling. The default is set via plugin parameters, whilst a specific
		shop's behaviour can be set via plugin command.
		Can now refresh all defined shops with a single plugin command.
0.1.0:	initial version; supports setting up shops, setting stock for items 
		in these shops, and limits the number of items that can be bought based 
		on remaining stock. If stock is not set for an item, buying that item is 
		not restricted.
 
Plugin commands:
initialise_shop_stock [shop]
Initialises a shop with the provided name. Run this before using any of the following commands for the shop. Can be used to completely reset a shop if it already exists.
open_shop [shop]
Sets the named shop as the current shop; stock information will be selected based on this.
close_shop
Clears the current shop.
refresh_shop [shop]
Applies refresh behaviour for the specified shop.
refresh_all_shops
Applies refresh behaviour for every shop.
set_current_stock [shop] [item/weapon/armor] [id] [amount]
Sets the specified item's stock in the specified shop to the provided amount.
set_base_stock [shop] [item/weapon/armor] [id] [amount]
Sets the specified item's stock in the specified shop to the provided amount.
change_current_stock [shop] [item/weapon/armor] [id] [amount]
Adds the specified amount of stock to the specified item. If the value provided is negative, this will subtract stock from the shop (stopping at 0?)
change_base_stock [shop] [item/weapon/armor] [id] [amount]
Adds the specified amount of stock to the specified item. If the value provided is negative, this will subtract stock from the shop (stopping at 0?)
set_sellAddsStock [shop] [true/false]
Sets the shop behaviour for whether or not selling items to it adds stock.
set_refreshAddsStock [shop] [true/false]
Sets the shop behaviour for whether or not refreshing it adds stock or replaces current stock.

Free for use with commercial projects, though I'd appreciate being
contacted if you do use it in any games, just to know.

Notes:
Where stock has not been defined, the shop acts as if it has infinite stock
	This means selling items to a shop with infinite copies of it should not result in the stock suddenly becoming limited
Should stock be stored as a float? Can still provide an integer value with Math.floor().

TODO: last pass before release; hunt down bugs, check formatting.
 */ 
(function(){
	var parameters = PluginManager.parameters('FELD_ShopStock');
	
	var currentShop = null;
	
	var shopStock = Object();
	
	function initialiseShopStock(name)
	{
		shopStock[name] = Object();
		shopStock[name]['itemStock'] = Object();
		shopStock[name]['weaponStock'] = Object();
		shopStock[name]['armorStock'] = Object();
		shopStock[name]['itemBaseStock'] = Object();
		shopStock[name]['weaponBaseStock'] = Object();
		shopStock[name]['armorBaseStock'] = Object();
		shopStock[name].refreshAddsStock = (parameters["refreshAddsStock"] == 'true');
		shopStock[name].addStockOnSell = (parameters["addStockOnSell"] == 'true');
	}
	
	function openShop(name)
	{
		currentShop = name;
	}
	
	function closeShop()
	{
		currentShop = null;
	}
	
	function refreshShop(shopName)
	{
		if (shopName in shopStock)
		{
			for (var item in shopStock[shopName]['itemBaseStock'])
			{
				if (shopStock[shopName].refreshAddsStock)
				{
					if (typeof shopStock[shopName]['itemStock'][item] != 'undefined')
					{
						setCurrentStock(shopName, 'item', item, shopStock[shopName]['itemBaseStock'][item] + shopStock[shopName]['itemStock'][item]);
					}
					else
					{
						setCurrentStock(shopName, 'item', item, shopStock[shopName]['itemBaseStock'][item]);
					}
				}
				else
				{
					setCurrentStock(shopName, 'item', item, shopStock[shopName]['itemBaseStock'][item]);
				}
			}
			for (var weapon in shopStock[shopName]['weaponBaseStock'])
			{
				if (shopStock[shopName].refreshAddsStock)
				{
					if (typeof shopStock[shopName]['itemStock'][item] != 'undefined')
					{
						setCurrentStock(shopName, 'weapon', weapon, shopStock[shopName]['weaponBaseStock'][item] + shopStock[shopName]['weaponStock'][item]);
					}
					else
					{
						setCurrentStock(shopName, 'weapon', weapon, shopStock[shopName]['weaponBaseStock'][item]);
					}
				}
				else
				{
					setCurrentStock(shopName, 'weapon', weapon, shopStock[shopName]['weaponBaseStock'][item]);
				}
			}
			for (var armor in shopStock[shopName]['armorBaseStock'])
			{
				if (shopStock[shopName].refreshAddsStock)
				{
					if (typeof shopStock[shopName]['itemStock'][item] != 'undefined')
					{
						setCurrentStock(shopName, 'armor', armor, shopStock[shopName]['armorBaseStock'][item] + shopStock[shopName]['armorStock'][item]);
					}
					else
					{
						setCurrentStock(shopName, 'armor', armor, shopStock[shopName]['armorBaseStock'][item]);
					}
				}
				else
				{
					setCurrentStock(shopName, 'armor', armor, shopStock[shopName]['armorBaseStock'][item]);
				}
			}
		}
	}
	
	// refreshes ALL shops currently defined
	// TODO: do this
	function refreshAllShops()
	{
		for (var shop in shopStock)
		{
			refreshShop(shop);
		}
	}
	
	function setCurrentStock(shopName, itemType, itemId, stock)
	{
		if (itemType == 'item' || itemType == 'weapon' || itemType == 'armor')
		{
			shopStock[shopName][itemType+'Stock'][parseInt(itemId)] = parseInt(stock);
		}
	}
	
	function getCurrentStock(shopName, item)
	{
		stock = undefined;
		
		if (shopName != null)
		{
			console.log("getting current stock for " + item.name + " in " + shopName);
			if (DataManager.isItem(item)) // item
			{
				//console.log(item.name + " is an item");
				stock = shopStock[shopName]['itemStock'][item.id];
				//console.log(shopName + " has " + stock + " " + item.name);
			}
			else if (DataManager.isWeapon(item)) // weapon
			{
				//console.log(item.name + " is a weapon");
				stock = shopStock[shopName]['weaponStock'][item.id];
				//console.log(shopName + " has " + stock + " " + item.name);
			}
			else if (DataManager.isArmor(item)) // armor
			{
				//console.log(item.name + " is armor");
				stock = shopStock[shopName]['armorStock'][item.id];
				//console.log(shopName + " has " + stock + " " + item.name);
			}
		}
		
		return stock;
	}
	
	function setBaseStock(shopName, itemType, itemId, stock)
	{
		if (itemType == 'item' || itemType == 'weapon' || itemType == 'armor')
		{
			shopStock[shopName][itemType+'BaseStock'][parseInt(itemId)] = parseInt(stock);
		}
	}
	
	// may not be useful in this form, if this needs the item
	function getBaseStock(shopName, item)
	{
		var stock = undefined;
		if (shopName != null)
		{
			console.log("getting base stock for " + item.name + " in " + shopName);
			if (DataManager.isItem(item)) // item
			{
				//console.log(item.name + " is an item");
				stock = shopStock[currentShop]['itemBaseStock'][item.id];
			}
			else if (DataManager.isWeapon(item)) // weapon
			{
				//console.log(item.name + " is a weapon");
				stock = shopStock[currentShop]['weaponBaseStock'][item.id];
			}
			else if (DataManager.isArmor(item)) // armor
			{
				//console.log(item.name + " is armor");
				stock = shopStock[currentShop]['armorBaseStock'][item.id];
			}
		}
		
		return stock;
	}
	
	function changeCurrentStock(shopName, itemType, itemId, stock)
	{
		if (itemType == 'item' || itemType == 'weapon' || itemType == 'armor')
		{
			shopStock[shopName][itemType+'Stock'][parseInt(itemId)] += parseInt(stock);
			if (shopStock[shopName][itemType+'Stock'][parseInt(itemId)] < 0)
			{
				shopStock[shopName][itemType+'Stock'][parseInt(itemId)] = 0;
			}
		}
	}
	
	function changeBaseStock(shopName, itemType, itemId, stock)
	{
		if (itemType == 'item' || itemType == 'weapon' || itemType == 'armor')
		{
			shopStock[shopName][itemType+'BaseStock'][parseInt(itemId)] += parseInt(stock);
			if (shopStock[shopName][itemType+'BaseStock'][parseInt(itemId)] < 0)
			{
				shopStock[shopName][itemType+'BaseStock'][parseInt(itemId)] = 0;
			}
		}
	}
	
	// overwrite; need to draw stock, but drawItemName is used elsewhere, so we're replacing the use of drawItemName with drawShopItemName
	var oldDrawItem = Window_ShopBuy.prototype.drawItem;
	Window_ShopBuy.prototype.drawItem = function(index) {
		var item = this._data[index];
		var rect = this.itemRect(index);
		var priceWidth = 96;
		rect.width -= this.textPadding();
		this.changePaintOpacity(this.isEnabled(item));
		this.drawShopItemName(item, rect.x, rect.y, rect.width - priceWidth);
		this.drawText(this.price(item), rect.x + rect.width - priceWidth,
					  rect.y, priceWidth, 'right');
		this.changePaintOpacity(true);
	};

	Window_ShopBuy.prototype.drawShopItemName = function(item, x, y, width) {
		width = width || 312;
		if (item) {
			var iconBoxWidth = Window_Base._iconWidth + 4;
			this.resetTextColor();
			this.drawIcon(item.iconIndex, x + 2, y + 2);
			var stock = getCurrentStock(currentShop, item);
			if (!(stock === undefined))
			{
				this.drawText(item.name + " (" + stock + ")", x + iconBoxWidth, y, width - iconBoxWidth);
			}
			else
			{
				this.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth);
			}
		}
	};
	
	// adding an extra check here to ensure the shop still has stock for the item in question
	var oldIsEnabled = Window_ShopBuy.prototype.isEnabled;
	Window_ShopBuy.prototype.isEnabled = function(item) 
	{
		var isBuyable = oldIsEnabled.call(this, item);
		if (isBuyable)
		{
			var stock = getCurrentStock(currentShop, item);
			if (!(stock === undefined))
			{
				if (stock <= 0)
				{
					isBuyable = false;
				}
			}
		}
		return isBuyable;
	};
	
	// removes stock from the shop after you buy something
	var oldDoBuy = Scene_Shop.prototype.doBuy;
	Scene_Shop.prototype.doBuy = function(number) 
	{
		oldDoBuy.call(this, number);
		if (!(stock === undefined))
		{
			if (DataManager.isItem(this._item)) // item
			{
				changeCurrentStock(currentShop, 'item', this._item.id, number*-1);
			}
			else if (DataManager.isWeapon(this._item)) // weapon
			{
				changeCurrentStock(currentShop, 'weapon', this._item.id, number*-1);
			}
			else if (DataManager.isArmor(this._item)) // armor
			{
				changeCurrentStock(currentShop, 'armor', this._item.id, number*-1);
			}
		}
	}
	
	// adding an extra check to make sure player can't buy more than stock by just requesting more
	var oldMaxBuy = Scene_Shop.prototype.maxBuy;
	Scene_Shop.prototype.maxBuy = function()
	{
		var max = oldMaxBuy.call(this);
		// check if max is higher than stock. If so, set max to stock.
		var stock = getCurrentStock(currentShop, this._item)
		if (!(stock === undefined))
		{
			if (max > stock)
			{
				max = stock;
			}
		}
		return max;
	}

	// adding stock back on sell, if the plugin is set up to do it
	var oldDoSell = Scene_Shop.prototype.doSell;
	Scene_Shop.prototype.doSell = function(number) {
		oldDoSell.call(this, number);
		var stock = getCurrentStock(currentShop, this._item);
		if (!(stock === undefined))
		{
			if (shopStock[currentShop].addStockOnSell)
			{
				if (currentShop != null)
				{
					if (DataManager.isItem(this._item)) // item
					{
						changeCurrentStock(currentShop, 'item', this._item.id, number);
					}
					else if (DataManager.isWeapon(this._item)) // weapon
					{
						changeCurrentStock(currentShop, 'weapon', this._item.id, number);
					}
					else if (DataManager.isArmor(this._item)) // armor
					{
						changeCurrentStock(currentShop, 'armor', this._item.id, number);
					}
				}
			}
		}
	};
	
	var FELD_ShopStock_aliasPluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args)
	{
		FELD_ShopStock_aliasPluginCommand.call(this,command,args);
		if(command == "initialise_shop_stock" && args[0] != null)
		{
			initialiseShopStock(args[0]);
		}
		else if(command == "open_shop" && args[0] != null)
		{
			openShop(args[0]);
		}
		else if(command == "close_shop" && args[0] != null)
		{
			closeShop();
		}
		else if(command == "refresh_shop" && args[0] != null)
		{
			refreshShop(args[0]);
		}
		else if(command == "refresh_all_shops")
		{
			refreshAllShops();
		}
		else if(command == "set_current_stock" && args[0] != null && args[1] != null && args[2] != null && args[3] != null)
		{
			setCurrentStock(args[0], args[1], args[2], args[3]);
		}
		else if(command == "set_base_stock" && args[0] != null && args[1] != null && args[2] != null && args[3] != null)
		{
			setBaseStock(args[0], args[1], args[2], args[3]);
		}
		else if(command == "change_current_stock" && args[0] != null && args[1] != null && args[2] != null && args[3] != null)
		{
			changeCurrentStock(args[0], args[1], args[2], args[3]);
		}
		else if(command == "change_base_stock" && args[0] != null && args[1] != null && args[2] != null && args[3] != null)
		{
			changeBaseStock(args[0], args[1], args[2], args[3]);
		}
		else if(command == "set_sellAddsStock" && args[0] != null && args[1] != null)
		{
			shopStock[args[0]].sellAddsStock = (args[1] == 'true');
		}
		else if(command == "set_refreshAddsStock" && args[0] != null && args[1] != null)
		{
			shopStock[args[0]].refreshAddsStock = (args[1] == 'true');
		}
	}
})();