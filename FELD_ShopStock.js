/*:
 * @plugindesc Implements limited stock for shops.
 * @author Feldherren
 * @help Shop Stock v1.0.0, by Feldherren (rpaliwoda AT googlemail.com)
 
Changelog:
1.0: initial release
 
Plugin commands:
initialise_shop_stock [shop]
Initialises a shop with the provided name. Run this before using any of the following commands for the shop. Can be used to completely reset a shop if it already exists.
open_shop [shop]
close_shop
refresh_shop [shop]
Sets the stock of all shop items to their base stock levels.
set_current_stock [shop] [item/weapon/armor] [id] [amount]
Sets the specified item's stock in the specified shop to the provided amount.
set_base_stock [shop] [item/weapon/armor] [id] [amount]
Sets the specified item's stock in the specified shop to the provided amount.
change_current_stock [shop] [item/weapon/armor] [id] [amount]
Adds the specified amount of stock to the specified item. If the value provided is negative, this will subtract stock from the shop (stopping at 0?)
change_base_stock [shop] [item/weapon/armor] [id] [amount]
Adds the specified amount of stock to the specified item. If the value provided is negative, this will subtract stock from the shop (stopping at 0?)

Free for use with commercial projects, though I'd appreciate being
contacted if you do use it in any games, just to know.

Notes:
Where stock has not been defined, should the shop act as usual with infinite stock? Probably.
 */ 
(function(){
	var parameters = PluginManager.parameters('FELD_ShopStock');
	
	var currentShop = null;
	
	var shopStock = Object();

	var FELD_ShopStock_aliasPluginCommand = Game_Interpreter.prototype.pluginCommand;
	
	function initialiseShopStock(name)
	{
		shopStock[name] = Object();
		shopStock[name]['itemStock'] = Object();
		shopStock[name]['weaponStock'] = Object();
		shopStock[name]['armorStock'] = Object();
		shopStock[name]['itemBaseStock'] = Object();
		shopStock[name]['weaponBaseStock'] = Object();
		shopStock[name]['armorBaseStock'] = Object();
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
			for (var item in shopStock[shopName]['itemStock'])
			{
				shopStock[shopName]['itemStock'][item] = shopStock[shopName]['itemBaseStock'][item];
			}
			for (var weapon in shopStock[shopName]['weaponStock'])
			{
				shopStock[shopName]['weaponStock'][weapon] = shopStock[shopName]['weaponBaseStock'][weapon];
			}
			for (var armor in shopStock[shopName]['armorStock'])
			{
				shopStock[shopName]['armorStock'][armor] = shopStock[shopName]['armorBaseStock'][armor];
			}
		}
	}
	
	function setCurrentStock(shopName, itemType, itemId, stock)
	{
		if (itemType == 'item' || itemType == 'weapon' || itemType == 'armor')
		{
			shopStock[shopName][itemType+'Stock'][itemId] = parseInt(stock);
		}
	}
	
	function setBaseStock(shopName, itemType, itemId, stock)
	{
		if (itemType == 'item' || itemType == 'weapon' || itemType == 'armor')
		{
			shopStock[shopName][itemType+'BaseStock'][itemId] = parseInt(stock);
		}
	}
	
	function changeCurrentStock(shopName, itemType, itemId, stock)
	{
		if (itemType == 'item' || itemType == 'weapon' || itemType == 'armor')
		{
			shopStock[shopName][itemType+'Stock'][itemId] += parseInt(stock);
		}
	}
	
	function changeBaseStock(shopName, itemType, itemId, stock)
	{
		if (itemType == 'item' || itemType == 'weapon' || itemType == 'armor')
		{
			shopStock[shopName][itemType+'BaseStock'][itemId] += parseInt(stock);
		}
	}
	
	function getItemStock(item)
	{
		stock = 0;
		return stock;
	}
	
	// overwrite; need to draw stock, too
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
			this.drawText(item.name + " (" + getItemStock(item) + ")", x + iconBoxWidth, y, width - iconBoxWidth);
		}
	};
	
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
	}
})();