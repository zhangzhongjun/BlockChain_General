'use strict';

var DepositeContent = function (text) {
	if (text) {
		var o = JSON.parse(text);
		this.balance = new BigNumber(o.balance);
		this.expiryHeight = new BigNumber(o.expiryHeight);
	} else {
		this.balance = new BigNumber(0);
		// 锁定的高度
		this.expiryHeight = new BigNumber(0);
	}
};

DepositeContent.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

// 构造函数
var BankVaultContract = function () {
	LocalContractStorage.defineMapProperty(this, "bankVault", {
		parse: function (text) {
			return new DepositeContent(text);
		},
		stringify: function (o) {
			return o.toString();
		}
	});
};

// save value to contract, only after height of block, users can takeout
BankVaultContract.prototype = {
	// 初始化函数
	init: function () {
		//TODO:
	},

	// 存钱的函数
	// 锁定的高度，如height=5，则锁定5个区块之后才能花这笔钱
	save: function (height) {
		// 存钱的用户
		var from = Blockchain.transaction.from;
		// 存钱的金额
		var value = Blockchain.transaction.value;
		// 当前交易所在的块的高度
		var bk_height = new BigNumber(Blockchain.block.height);
		// 该用户存钱的保险柜
		var orig_deposit = this.bankVault.get(from);
		// 如果该用户之前有信息，则加上
		if (orig_deposit) {
			value = value.plus(orig_deposit.balance);
		}
		var deposit = new DepositeContent();
		// 余额
		deposit.balance = value;
		// 生效的块高度
		deposit.expiryHeight = bk_height.plus(height);
		this.bankVault.put(from, deposit);
	},
	// 取钱
	takeout: function (value) {
		var from = Blockchain.transaction.from;
		var bk_height = new BigNumber(Blockchain.block.height);
		var amount = new BigNumber(value);
		var deposit = this.bankVault.get(from);
		if (!deposit) {
			throw new Error("No deposit before.");
		}
		// 当前高度小于锁定的高度
		if (bk_height.lt(deposit.expiryHeight)) {
			throw new Error("Can not takeout before expiryHeight.");
		}
		if (amount.gt(deposit.balance)) {
			throw new Error("Insufficient balance.");
		}
		var result = Blockchain.transfer(from, amount);
		if (!result) {
			throw new Error("transfer failed.");
		}
		// 触发一个事件 从合约地址中取出钱给调用takeout函数的用户
		Event.Trigger("BankVault", {
			Transfer: {
				// from是合约地址
				from: Blockchain.transaction.to,
				to: from,
				value: amount.toString()
			}
		});
		deposit.balance = deposit.balance.sub(amount);
		this.bankVault.put(from, deposit);
	},

	//获得余额
	balanceOf: function () {
		var from = Blockchain.transaction.from;
		return this.bankVault.get(from);
	},

	// 验证地址是否是合法的
	verifyAddress: function (address) {
		// 1-valid, 0-invalid
		var result = Blockchain.verifyAddress(address);
		return {
			valid: result == 0 ? false : true
		};
	}
};

module.exports = BankVaultContract;
