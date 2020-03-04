import threading,time
import asyncio
from aiohttp import web
import socketio

# creates a new Async Socket IO Server
sio = socketio.AsyncServer()
# Creates a new Aiohttp Web Application
app = web.Application()
# Binds our Socket.IO server to our Web App
# instance
sio.attach(app)

# @sio.event
# def connect(sid, environ):
#     print('connect ', sid)

# # If we wanted to create a new websocket endpoint,
# # use this decorator, passing in the name of the
# # event we wish to listen out for
# @sio.on('my_msg')
# async def print_message(sid, message):
#     # When we receive a new event of type
#     # 'message' through a socket.io connection
#     # we print the socket ID and the message
#     print("Socket ID: " , sid)
#     print(message)
#     await sio.emit('my_message', {'data': message},to=sid)


# @sio.event
# def disconnect(sid):
#     print('disconnect ', sid)

class MyCustomNamespace(socketio.AsyncNamespace):
    def on_connect(self, sid, environ):
        print('connect ', sid)
        t = threading.Thread(target=self.task1)
        t.start()

    def on_disconnect(self, sid):
        print('disconnected ', sid)

    async def on_my_msg(self, sid, data):
        print("Socket ID: " , sid)
        print(data)
        await self.emit('my_message', {'data': data})
    
    async def task1(self):
        while True:
            asyncio.sleep(1)
            print({'data': 'hello repeat'})
            await self.emit('my_message', {'data': 'hello repeat'})





# We kick off our server
if __name__ == '__main__':
    myobj = MyCustomNamespace('/test')
    sio.register_namespace(MyCustomNamespace('/test'))
    web.run_app(app,port=5678)