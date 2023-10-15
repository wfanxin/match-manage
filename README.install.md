#### 安装流程

#####  1.拉取代码

```
git clone git@github.com:wfanxin/match-manage.git 
```

##### 2.安装依赖

```
npm install 
```

##### 3.修改接口域名

```
vim config/prod.env.js
```

##### 4.编译生成dist文件

```
npm run build:prod
```

##### 5.伪静态配置

```
location / {
    try_files $uri $uri/ /index.html =404;
}
```

