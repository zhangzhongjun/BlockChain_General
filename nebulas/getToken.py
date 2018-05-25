#https://testnet.nebulas.io/claim/api/claim/122@qq.com/n1Ptpz3HQ9aquPwk5qXygHdCfNqGEMXqJN8/
import time
import requests
parameter={}
if __name__=="__main__":
    for i in range(100,300,1):
        time.sleep(1)
        url = "https://testnet.nebulas.io/claim/api/claim/1014830"+str(i)+"@qq.com/n1Ptpz3HQ9aquPwk5qXygHdCfNqGEMXqJN8/"
        print(url)
        res = requests.get(url,params = parameter,timeout=10)
        
        print(res.text)