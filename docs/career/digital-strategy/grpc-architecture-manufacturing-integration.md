---
title: gRPC 架构：企业内部服务通信与制造业系统集成
toc: content
order: 9
---

# gRPC 架构：企业内部服务通信与制造业系统集成

## 背景
制造业的系统在引入微服务架构，API Gateway、集成平台之类的技术后，不可避免得，就要涉及服务之间的通信问题。而gRPC是其中很常见的一种通信方式，很适合服务之间的通信。

其他的方式还有：
- HTTP/HTTPS+API：最通用,适合系统之间的开放式 API 调用
- 消息队列（MQ）：适合异步通信、事件驱动和系统解耦
- WebSocket： 主要解决：服务器需要主动、持续地把消息推给客户端。

## gRPC的优势
与HTTP/HTTPS相比，具有以下优势：
- 更高通信效率：底层基于HTTP/2，可以利用多路复用、二进制传输等特性，在大量通信时，表现更好。
- 强类型：可以约定具体的参数类型及返回格式
- 自动生成代码： 使用protoc及各语言的插件，可以生成相应语言的代码。

## 相关概念
### .proto
gRPC通常要先定义一个proto的的文件，里面定义接口的相关信息，如：
```
syntax = "proto3";

service OrderService {
    rpc GetOrder(GetOrderRequest) returns (OrderResponse);
}

message GetOrderRequest {
    int64 order_id = 1;
}

message OrderResponse {
    int64 order_id = 1;
    string order_no = 2;
    string status = 3;
}
```
这里告诉相关的服务：

ERP 提供一个叫 OrderService 的服务，有一个 GetOrder 方法，输入 GetOrderRequest，返回 OrderResponse。

它是调用方和服务提供方共同遵守的“接口契约”，双方都需要它。

### protoc及插件
需要在服务器上安装protoc，然后安装相应的插件，比如Go：
```
protoc-gen-go
protoc-gen-go-grpc
```

然后执行：
```
protoc \
  --go_out=. \
  --go-grpc_out=. \
  order.proto
```
会生成：
```
order.pb.go
order_grpc.pb.go
```

### 业务逻辑实现
服务提供方，需要实现相应的业务逻辑。并启动相应的gRPC Server。

### 服务调用
调用方在获取到相应的服务地址后，可以根据protoc生成的文件，初始化相应的客户端，并调用相应的方法。


## 网关通信实例
### 背景
假设API Gateway使用Go开发。 ERP端使用PHP+Laravel开发。现在要提供一个订单查询的服务。

### 先定义订单服务合同
```
contracts/proto/order.proto
```
例如：
```
syntax = "proto3";

package order;

option go_package = "forgeone/contracts/order";

service OrderService {
    rpc GetOrder(GetOrderRequest) returns (OrderResponse);
}

message GetOrderRequest {
    int64 order_id = 1;
}

message OrderResponse {
    int64 order_id = 1;
    string order_no = 2;
    string customer_name = 3;
    string status = 4;
    double amount = 5;
}
```

表达的是：ERP 提供一个 OrderService，其中有一个 GetOrder() 方法。

这个文件可能会有多个项目共用的，最好独立出来，其他项目通过git的submodule或其他的方式共享。

### 根据proto生成代码
```
                    order.proto
                        │
             ┌──────────┴──────────┐
             ↓                     ↓
       Go protoc plugins       PHP protoc plugins
             ↓                     ↓
       Go Client/Server        PHP Client/Server
```

### ERP端实现生成的接口
例如：
app/Grpc/OrderService.php

实现业务逻辑：
```
class OrderService extends OrderServiceInterface
{
    public function GetOrder(
        GetOrderRequest $request
    ): OrderResponse {

        $order = Order::find($request->getOrderId());

        return new OrderResponse([
            'order_id' => $order->id,
            'order_no' => $order->order_no,
            'customer_name' => $order->customer_name,
            'status' => $order->status,
            'amount' => $order->amount,
        ]);
    }
}
```

### 启动gRPC Server
监听当前的服务端口？

### API Gateway 生成Client并调用
建立连接：
```
conn, err := grpc.NewClient(
    "10.10.1.20:50051",
    grpc.WithTransportCredentials(
        insecure.NewCredentials(),
    ),
)
```

然后：
```
client := pb.NewOrderServiceClient(conn)
```
现在 Gateway 就拥有：
```
OrderServiceClient
```

## 总结
完整的链路如下：
```
                         
                         API  Gateway
                             
Browser
   │
   │ GET /api/orders/10001
   ↓
┌──────────────────────────────┐
│ Go Gateway                   │
│                              │
│ Route                        │
│   ↓                          │
│ Order Service                │
│   ↓                          │
│ gRPC Client                  │
└──────────────┬───────────────┘
               │
               │ gRPC
               │ Protobuf
               │ HTTP/2
               ↓
       10.10.1.20:50051
               │
               ↓
┌──────────────────────────────┐
│  ERP                     │
│                              │
│ Laravel gRPC Server          │
│       ↓                      │
│ OrderService                 │
│       ↓                      │
│ Order Model                  │
│       ↓                      │
│ MySQL                        │
└──────────────────────────────┘
```
