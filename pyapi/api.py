#!/usr/bin/env python

# WS server that sends messages at random intervals

import asyncio
import datetime
import random
import websockets
import json
import random
import time

# async def handler(websocket, path):
#     # register(websocket) sends user_event() to websocket
#     try:
#         async for message in websocket:
#             data = json.loads(message)
#             print('read from client: ' + data)
#             echo = {'data': data}
#             await websocket.send(json.dumps(echo))
#     except Exception as e:
#         print(e)

# def sendMsg(websocket):
#     while True:
#         try:
#             time.sleep(1)
#             n = datetime.datetime.now()
#             msg = n.strftime('%Y%m%d %H:%M:%S')
#             print('send to client: ' + msg)
#             websocket.send(json.dumps(msg))
#         except Exception as e:
#             print(e)



# n = datetime.datetime.now()
# msg = n.strftime('%Y%m%d %H:%M:%S')
# print(msg)
# startT = time.time()
# start_server = websockets.serve(handler, "127.0.0.1", 5678)
# endT = time.time()
# print('create server: {}'.format(endT-startT))
# startT = time.time()
# asyncio.get_event_loop().run_until_complete(start_server)
# endT = time.time()
# print('create run server: {}'.format(endT-startT))
# asyncio.get_event_loop().run_forever()

class MyAPI(object):
    async def handler(self,websocket, path):
        # register(websocket) sends user_event() to websocket
        try:
            async for message in websocket:
                msg = json.loads(message)
                print('received client msg')
                print(msg)
                cmd = msg["cmd"]
                data = msg["data"]
                if cmd == 'give_me_money':
                    money = data
                    raise Exception
                    await self.check_money(websocket, money)
                    
                elif cmd == 'received_money':
                    print('received client money')
                    print(cmd, data)
        except Exception as e:
            print(e)


    async def check_money(self, websocket, money):
        n = datetime.datetime.now()
        now = n.strftime('%Y%m%d %H:%M:%S')
        money = money-250
        await self.sendMsg(websocket,'give_you_money',{'time':now,'money':money})

    async def sendMsg(self, websocket, cmd, data=None):
        msg = {'cmd': cmd, 'data': data}
        print('server sent msg: {}'.format(msg))
        await websocket.send(json.dumps(msg))
    # def sendMsg(self,websocket):
    #     while True:
    #         try:
    #             time.sleep(1)
    #             n = datetime.datetime.now()
    #             msg = n.strftime('%Y%m%d %H:%M:%S')
    #             print('send to client: ' + msg)
    #             websocket.send(json.dumps(msg))
    #         except Exception as e:
    #             print(e)

def get_callback():
    return 'hello'

n = datetime.datetime.now()
msg = n.strftime('%Y%m%d %H:%M:%S')
print(msg)
startT = time.time()
s=MyAPI()
start_server = websockets.serve(s.handler, "127.0.0.1", 5678)
endT = time.time()
print('create server: {}'.format(endT-startT))
startT = time.time()
asyncio.get_event_loop().run_until_complete(start_server)
endT = time.time()
print('create run server: {}'.format(endT-startT))
asyncio.get_event_loop().run_forever()