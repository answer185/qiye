---
title: 使用Docker搭建Magento2的本地开发环境
toc: content
group:
  title: Magento
  order: 1
order: 2
---

# 使用Docker搭建Magento2的本地开发环境
## 背景
Magento 是一个依赖较多的电商系统，运行环境涉及：

- PHP
- MySQL
- Redis
- OpenSearch
- Nginx

如果直接在本机安装这些服务，不仅配置复杂，而且不同项目之间容易产生版本冲突。

因此本文采用 Docker 构建一个完全隔离的本地开发环境：

- 本机无需安装 PHP、MySQL、Redis 等服务
- 通过 Docker Compose 管理所有依赖
- 支持多分支、多数据库独立开发

## 目录结构
- ecommerce : 电商应用的目录文件夹
  - magento-dev ： Magento应用目录
    - docker-compose.yml ： compose配置文件
    - docker ： docker相关的配置文件
      - php
        - Dockerfile ： 还需要安装php的相关扩展
      - nginx
        - default.conf ： magento站点的nginx配置。
    - src: magento的程序目录
## docker-compose.yml
根据[官网的版本](https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/system-requirements)要求，配置相应的服务：
```yml
version: "3.9"

services:

  nginx:
    image: nginx:1.28
    container_name: ecommerce-nginx
    ports:
      - "8080:80"
    volumes:
      - ./src:/var/www/html
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - php
    networks:
      - ecommerce

  php:
    build:
      context: ./docker/php
    container_name: ecommerce-php
    volumes:
      - ./src:/var/www/html
    networks:
      - ecommerce

  mysql:
    image: mysql:8.4
    container_name: ecommerce-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
    ports:
      - "3307:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - ecommerce

  redis:
    image: redis:7
    container_name: ecommerce-redis
    networks:
      - ecommerce

  opensearch:
    image: opensearchproject/opensearch:3
    container_name: ecommerce-opensearch
    environment:
      - discovery.type=single-node
      - plugins.security.disabled=true
      - OPENSEARCH_INITIAL_ADMIN_PASSWORD=EcomSearch#2026!
      - bootstrap.memory_lock=true
      - "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    networks:
      - ecommerce
volumes:
  mysql-data:

networks:
  ecommerce:
```
配置说明：
- "8080:80"： 电脑端口使用8080
- ./src:/var/www/html： 将src映射到nginx的根目录。
- mysql的端口 "3307:3306"，使用3307，因为本地还有个mysql 8.0的版本，已经使用了3306
- OPENSEARCH_INITIAL_ADMIN_PASSWORD=EcomSearch#2026!： 设置opensearch的密码，3要求这个密码必须设置，且必须包含数字，字母及特殊字符。

## php的Dockerfile
制作 php的镜像，包含运行magento的必要依赖和扩展。
```
FROM php:8.4-fpm

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libxslt1-dev \
    libicu-dev \
    libcurl4-openssl-dev \
    libssl-dev \
    pkg-config \
    libsodium-dev \
    && rm -rf /var/lib/apt/lists/*

# 配置 GD
RUN docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg

# 安装 PHP 扩展（Magento 必需）
RUN docker-php-ext-install -j$(nproc) \
    bcmath \
    ctype \
    curl \
    dom \
    fileinfo \
    gd \
    intl \
    mbstring \
    opcache \
    pdo_mysql \
    simplexml \
    soap \
    sockets \
    sodium \
    xsl \
    zip \
    ftp

# 安装 Redis 扩展
RUN pecl install redis \
    && docker-php-ext-enable redis

# 安装 Composer（从官方镜像复制）
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 9000

CMD ["php-fpm"]
```

## nginx的配置文件

```conf
upstream fastcgi_backend {
    server php:9000;
}

server {
    listen 80;
    server_name localhost;

    set $MAGE_ROOT /var/www/html;
    set $MAGE_MODE developer;

    include /var/www/html/nginx.conf.sample;
}
```
在server里导入magento官方提供的nginx.conf.sample即可。
fastcgi_backend是nginx.conf.sample需要用到的，设置php的服务地址。


## Docker 启动
### 首次启动
首次启动需要build，构建相应的php镜像：
```sh
docker compose up -d --build
docker ps
```
启动成功后，可以看到相应的服务：
- ecommerce-nginx
- ecommerce-php
- ecommerce-mysql
- ecommerce-redis
- ecommerce-opensearch

### 安装Magento 2.4.8-p3
- 进入php的容器
```sh
docker exec -it ecommerce-php bash
```
1. -i: interactive, 保持STDIN打开，允许输入命令
2. -t: 分配一个终端

- 登录magento账户，[获取key](https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/prerequisites/authentication-keys)
- composer设置相应的key
```sh
composer config --global http-basic.repo.magento.com PUBLIC_KEY PRIVATE_KEY
```
- 设置composer的源，否则可能识别不到magento的最新版本。
```sh
composer config --global repositories.magento composer https://repo.magento.com/
// 确认库已经添加
composer config --global --list | grep repo
// 查看版本列表
composer show magento/project-community-edition --all
```
- 安装指定的版本
```sh
composer create-project magento/project-community-edition=2.4.8-p3 .
```
注意需要保证在nginx的根目录，/var/www/html
- 创建数据库。这里使用mysq workbench连接并创建。charset为utf8mb4, collaction为：utf8mb4_unicode_ci
- 执行setup指令安装
```sh
php bin/magento setup:install \
--base-url=http://localhost:8080 \
--db-host=mysql \
--db-name=magento \
--db-user=root \
--db-password=root \
--admin-firstname=Admin \
--admin-lastname=User \
--admin-email=admin@example.com \
--admin-user=admin \
--admin-password=Admin123! \
--language=zh_Hans_CN \
--currency=CNY \
--timezone=Asia/Shanghai \
--use-rewrites=1 \
--search-engine=opensearch \
--opensearch-host=opensearch \
--opensearch-port=9200
```
需要注意，如果admin-password带有特殊字符，如@, $等，最好加上单引号，避免命令被打断。


### 安装过程的可能问题
- 内存不足：默认的php内存是128M,magento需要至少 2G
```sh
echo "memory_limit=4G" > /usr/local/etc/php/conf.d/memory-limit.ini
docker compose restart php
```
- 打开后，显示无法访问： nginx的default.conf没有配置
- 后台登录报: Failed to send the message, Please contact the administrator
这是因为开启了2FA验证，需要发邮件，但是我本地没有smtp服务。（生产环境不建议关闭）
```sh
docker exec -it ecommerce-php bash
php bin/magento module:disable Magento_AdminAdobeImsTwoFactorAuth Magento_TwoFactorAuth
php bin/magento cache:flush
```


## git提交
设置.gitignore
```sh
# =====================
# Magento
# =====================

src/vendor/
src/generated/
src/var/
src/pub/static/
src/pub/media/
src/app/etc/env.php

# OS
.DS_Store

# Logs
*.log

# IDE
.vscode/
.idea/

# Docker runtime files
mysql-data/
```
根据项目需要，还可以设置相应的tag, 特性分支。
