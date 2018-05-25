import requests
parameter={}

if __name__=="__main__":
    url = 'https://www.feixiaohao.com/currencies/nebulas/'
    res = requests.get(url,params = parameter,timeout=10,auth=False)
    
    print(res.text)