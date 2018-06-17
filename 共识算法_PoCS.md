# PoCS共识算法

> Proof of Credit Share，信用贡献证明机制(又称共享交换平衡机制)，是公信链自主设计开发的共识机制，⽤来解决数据体量悬殊企业之间的共享交换不平衡问题。

公信链以及相关代码已经在Github上完全开源。

开源地址 https://github.com/gxchain

## 伪代码

联盟成员每完成一笔数据交易，则计算一次PoCS，贡献比根据买卖次数计算，并参与数据交易手续费的计算。PoCS低的联盟成员，将会付出比基准手续费更高的费用换回数据，PoCS高的联盟成员将会付出比基准手续费更低的费用换回数据。

PoCS和交易手续费实现原理的伪代码如下：

```c
if ((total_sell + total_buy) >= pocs_threshold) {

    pocs = calculate_pocs(total_sell, total_buy);

    fee = scale_fee(pocs, data_transaction_base_fee);

} else {

    fee = data_transaction_base_fee;
}
```

pocs：贡献比，一个联盟成员在一个联盟中有且只有一个贡献比。

total_sell：当前账户卖数据的总次数。

total_buy：当前账户买数据的总次数。

pocs_threshold：产品阈值，若当前账户买卖总次数大于等于此阈值，才启用贡献比参与最终手续费的计算。

data_transaction_base_fee：不考虑贡献比的基准手续费，即全局参数中操作的手续费。

calculate_pocs：根据买卖数据次数计算PoCS。

scale_fee：根据pocs调整交易手续费