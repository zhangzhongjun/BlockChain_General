## PoA
prove of authority

### PoA的特点
× PoA是依靠预设好的授权节点(signers)，负责产生block.
× 可以由已授权的signer选举(投票超过50%)加入新的signer。
× 即使存在恶意signer,他最多只能攻击连续块(数量是 (SIGNER_COUNT / 2) + 1) 中的1个,期间可以由其他signer投票踢出该恶意signer。
× 可指定产生block的时间。

### PoA的流程
1. 在创世块中指定一组初始授权的signers, 所有地址 保存在创世块Extra字段中
2. 启动挖矿后, 该组signers开始对生成的block进行签名并广播.
3. 签名结果 保存在区块头的Extra字段中
4. Extra中更新当前高度已授权的 所有signers的地址 ,因为有新加入或踢出的signer
5. 每一高度都有一个signer处于IN-TURN状态, 其他signer处于OUT-OF-TURN状态, IN-TURN的signer签名的block会立即广播 , OUT-OF-TURN的signer签名的block会延时一段随机时间后再广播, 保证IN-TURN的签名block有更高的优先级上链
6. 如果需要加入一个新的signer, signer通过API接口发起一个proposal, 该proposal通过复用区块头 Coinbase(新signer地址)和Nonce("0xffffffffffffffff") 字段广播给其他节点. 所有已授权的signers对该新的signer进行"加入"投票, 如果赞成票超过signers总数的50%, 表示同意加入
7. 如果需要踢出一个旧的signer, 所有已授权的signers对该旧的signer进行"踢出"投票, 如果赞成票超过signers总数的50%, 表示同意踢出



## 测试网络
morden
ropsten
kovan


## UTXO(Unspent Transaction Output)包含两部分
1. 所有者
2. 余额

## APPLY(S,TX) -> S`
1. TX中的每个输入，如果被引用的UTXO不在S中，返回一个错误
2. TX中的每个输入，如果提供的签名和UTXO中的所有者不匹配，则返回一个错误
3. 如果所有的输入UTXO的总和 小于 所有的输出UTXO的总和，则返回一个错误

## 验证一个区块的过程
1. 检查该区块引用的上一个区块是否存在并且有效
2. 检查该区块的时间戳是否大于上一个区块的时间戳并且小于2小时
3. 检查该区块上的POW是否有效
4. 是S[0]成为上一个区块最末端的状态
5. 对于每个交易TX，S[i+1] = APPLY(S[i],TX),如果任意一个APPLY出错，则返回false
6. 返回true，将S[n]放在该区块的最末端的状态

## 简化支付验证 SPV
1. 只下载和保存区块的头信息
2. 在区块头中验证POW
3. 只下载merkle 树中与该交易相关的分支

## 账户包括外部账户和合约账户
× 外部账号：EOA账户，有用户控制
× 合约账号：由合约代码控制，只能由一个EOA账号来操作

## 链的种类
公有链：世界上任何一个人都可以参与区块链，用户可以查看，可以发送交易，也可以参与保持数据一致性的运算等
私有链：完全的私有链是指写数据是由一个人或一个单一的组织控制的链。私有链的读权限可以公开或者在一定范围内公开
联盟链：数据一致性的运算是预定义的几个节点共同控制的链，在这个链中，每一个节点的每一次操作都需要若干节点的共同签名才能验证，这种链上的读权限可能是公开的，也有可能是部分公开的。

Mist: 一个去中心化的web3.0应用的浏览器
Ethereum Wallet: 一个只绑定了以太坊钱包应用的Mist浏览器

GAS成本：一个计算步骤的成本，即一个计算消耗多少GAS
GAS价格：以以太币计算的价值
GAS限额：一个交易中心的GAS消耗的上限
GAS费用：一个交易中心所消耗的GAS总数，即交易成本。GAS费用反应了网络中的计算负荷，交易量，区块大小等。GAS费用是要支付给矿工的。

## 搭建一个私有链

### 步骤
1. 自定义gensis文件
```json
{
 "nonce": "0x0000000000000042",
 "timestamp": "0x00",
 "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
 "extraData": "0x00",
 "gasLimit": "0x8000000",
 "difficulty": "0x400",
 "mixhash": "0x0000000000000000000000000000000000000000000000000000000000000000",
 "coinbase": "0x1234567890123456789012345678901234567890",
 "alloc": {
 },
 "config": {
  "chainId": 15,
  "homesteadBlock": 0,
  "eip155Block": 0,
  "eip158Block": 0
 }
}
```
× nonce: 64bits 的哈希值，和mixhash配合，一起证明在区块链上做了足够多的计算量
× mixhash: 一个256 bits的哈希值，一起用来证明在区块链上做了足够多的计算量
× difficulty: 定义挖矿的目标，可以由一个区块的难度值和时间戳计算出来
× alloc: 预先填入一些钱包和余额
× coinbase: 160 bits的钱包地址，是挖出该区块的矿工的钱包地址
× timestamp: 时间戳
× extraData: 32 bits的额外信息，比如你的姓名等，让其他人知道这条私有链是由你创建的
× gasLimit: 当前链中一个区块所能消耗的gas上限
× parentHash: 父亲区块的256 bits 哈希值

使用`init "/home/zhang/EthLearning/CustomGenesis.json"`来指定配置文件的位置

2. 自定义数据目录
--datadir "/home/TestChain1" 定义存放区块数据的路径

3. 自定义网络id
--networkid 1006

4. 关闭节点发现协议
--nodiscover 确保其他人不能发现你的节点，否则，可能会有人连接到你的私链中

5. 其他参数
--identity “MyNodeName” 定义节点id
--port “30303”
--rpc 在你的节点激活RPC接口
--rpcport “8086” 监听RPC请求的端口
--rpccorsdomain "http://chriseth.github.io/browser-solidity" 设置可以连接到你的节点的url，以执行rpc客户端的任务
--rpcapi "db,eth,net,web3" 定义那些接口可以通过RPC访问

### 创建本地私有网络
```bash
geth --identity "MyNodeName" --rpc --rpcport "8086" --rpccorsdomain "*" --datadir "/home/TestChain_TrainData" --port "30303" --nodiscover --rpcapi “db,eth,net,web3” --networkid 1006 init "/home/zhang/EthLearning/CustomGenesis.json"
```

### 运行本地网络
```bash
geth --identity "MyNodeName" --rpc --rpcport "8080" --rpccorsdomain "*" --datadir "/home/TestChain_TrainData" --port "30303" --nodiscover --rpcapi "db,eth,net,web3" --networkid 1006 console
```


