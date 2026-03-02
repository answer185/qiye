---
title: Docker的基础概念
toc: content
group:
  title: Docker
  order: 1
order: 1
---

# Docker的基础概念
## 解决的问题
Docker实现了应用层级的隔离，其针对的核心问题是：
- 团队里每个人电脑系统、PHP、MYSQL等版本经常是不同的
- 项目随着时间的迁移，各项目之间的依赖版本也会变化。

Docker将运行环境也作为代码的一部分，通过拉取镜像并启动独立的容器来实际应用层级的隔离，保证在不同环境和时间节点上，项目的运行都是一样的。

## 镜像
### 镜像是什么
它是各应用的模板，可以从DockerHub上拉取，也可以使用DockerFile制作镜像并发布。比如php, redis,mysql等。它们通常都包含了：
- 操作系统基础层（通常是精简 Linux）
- 运行环境（如 PHP、Node、MySQL）
- 依赖库
- 启动命令（CMD / ENTRYPOINT）
本质上，它们是：一个只读的分层文件系统 + 启动配置

### 基础层是否会共享
很多镜像都包含操作系统基础层，它们的基础层如果是一样的，则会共用，并不是会再建立一套。

Docker的镜像是分层存储的。比如php:8.3-fpm和nginx:1.25的dockerfilef都有
```sh
FROM debian:bookworm
```
那么它们的 Debian 基础层是完全共用的

镜像也不会包含完整的Linux系统，通常只包含文件系统。不会包含Linux内核，真正的内核是宿主机的内核。macOS或Windows，会有一个Linux VM虚拟机，会使用该内核。

## 容器
### 镜像的实例
它是各镜像应用启动后的实例，一个镜像可以启动多个容器。它们是隔离的，有各自的数据卷。数据卷是保留数据，方便下次启动时读取，比如mysql的数据库表的数据。 

Docker有一个默认的bridge网络，所有的容器默认都在这个网络里，也可以创建一个新的网络。容器可以加入不同的网络。

### 与虚拟机的不同
容器并不是虚拟机，它：
- 不包含完整操作系统
- 共享宿主机内核
- 操作系统级资源隔离

### 网络和数据卷
容器可以加入不同的网络。

数据卷是挂载的，可以把容器里的数据映射到宿主机，持久存储。
```yml
volumes:
  - mysql_data:/var/lib/mysql
```
如果不挂载，则容器删除，数据就没了。

## Docker compose
是针对项目的使用场景。使用一个Yml文件来配置项目运行所依赖的镜像，及启动镜像的网络和数据卷的设置。

例如，有一个项目，需要：
- nginx
- php-fpm
- mysql
- redis
- elasticsearch

如果用纯 docker run，管理起来会很混乱。
Compose可以通过YAML的配置文件，一条命令启动相关的服务。
```sh
docker compose up -d
```

## 与传统本机部署的区别
在没有 Docker 前，通常的做法是：

在宿主机上：
- 安装 Nginx
- 安装 PHP
- 安装 MySQL
- 配置 Nginx 连接 PHP-FPM
- 配置 PHP 支持 MySQL
- 代码放到站点根目录，如 /usr/local/var/www
- 配置本地域名，如 mg24.test
- 修改 hosts
- 重启服务

所有东西：

都安装在你的系统里

所以：
- 会污染环境
- 版本冲突
- 多项目不好切换

现在使用docker compose的方式，会：
- 自动创建网络
- 启动相应的服务容器
- 自动关联相关的服务

## 是否每个项目一套环境
通常企业里都会有很多个项目，现代主流的做法，是每个项目一套独立环境。
```txt
Project A
  ├── nginx
  ├── php
  ├── mysql

Project B
  ├── nginx
  ├── php
  ├── mysql
```
这种方式带来的好处是很明显的：
- 完全隔离
- 独立升级
- 独立部署
- 独立迁移
性价比还是很高的。在更大规模时，使用Kubernetes管理，自动调度资源。
在资金充足的情况下，完全可以这么做。

但是在某些场景下，比如基于magento这种资源消耗比较多的系统，还是需要考虑下资源消耗的问题。

假设一套 Magento 环境：
- mysql：300MB+
- opensearch：1~2GB（这个最重）
- php-fpm：100MB
- nginx：几十MB
如果 5 个站：内存可能 10GB 内存。

这时可以考虑折中方案：同体系的多站，使用共享的方式。特别是在测品阶段。如：
```txt
公共层（共享）
  ├── mysql（1）
  ├── redis（1）
  ├── opensearch（1）

站点层（隔离）
  ├── phpA
  ├── phpB
  ├── phpC
  ├── phpD
  ├── phpE

入口层
  ├── nginx（1）
```
优点：
- 资源可控
- 隔离粒度适中
- 单站可单独重启
- 数据库仍集中管理
