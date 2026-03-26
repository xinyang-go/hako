# Docker 部署指南

本指南介绍如何使用 Docker 部署 hako 应用。

## 快速开始

### 使用 Docker Compose（推荐）

```bash
# 构建并启动（首次运行或代码变更后）
docker compose up -d --build

# 启动已有容器
docker compose up -d

# 查看日志
docker compose logs -f

# 停止服务（保留数据卷）
docker compose down

# 停止服务并删除数据卷
docker compose down -v

# 重启服务
docker compose restart

# 查看运行状态
docker compose ps
```

### 使用 Docker 命令

```bash
# 构建镜像
docker build -t hako:latest .

# 运行容器
docker run -d \
  --name hako \
  --network=host \
  -v hako-data:/app/data \
  hako:latest

# 查看日志
docker logs -f hako

# 停止容器
docker stop hako
```

## 数据持久化

应用使用 Docker volume 挂载到 `/app/data` 目录，所有数据（包括 JWT_SECRET）都存储在此目录中。

首次启动时，会自动生成随机的 JWT_SECRET 并保存到 `/app/data/.env` 文件中。

### 查看数据

```bash
# 进入容器查看数据
docker exec -it hako sh
cat /app/data/.env
```

### 备份数据

```bash
# 备份 volume
docker run --rm \
  -v hako-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/hako-data-backup.tar.gz /data

# 恢复 volume
docker run --rm \
  -v hako-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/hako-data-backup.tar.gz --strip 1"
```

## 环境变量

### 自动生成的变量

首次启动时会自动生成以下环境变量并存储在 `/app/data/.env` 中：

- `JWT_SECRET`: 随机生成的 32 字节 base64 字符串

### 可自定义的环境变量

可以通过 `-e` 参数覆盖默认配置：

```bash
docker run -d \
  --name hako \
  --network=host \
  -v hako-data:/app/data \
  -e ADMIN_USERNAME=myadmin \
  -e ADMIN_PASSWORD=securepassword123 \
  -e ADMIN_EMAIL=admin@example.com \
  hako:latest
```

或在 docker-compose.yml 中添加：

```yaml
services:
  hako:
    environment:
      - ADMIN_USERNAME=myadmin
      - ADMIN_PASSWORD=securepassword123
      - ADMIN_EMAIL=admin@example.com
```

## 健康检查

容器包含健康检查配置，每 30 秒检查一次服务是否可用。

查看健康状态：

```bash
docker inspect --format='{{.State.Health.Status}}' hako
```

## 生产环境建议

1. **使用 HTTPS**: 在反向代理（如 Nginx）后部署
2. **修改默认密码**: 通过环境变量设置强密码
3. **定期备份**: 备份 `/app/data` volume
4. **限制资源**: 在 docker-compose.yml 中添加资源限制
5. **使用镜像标签**: 使用特定版本标签而非 latest

### 资源限制示例

```yaml
services:
  hako:
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M
```

## 故障排查

### 查看日志

```bash
docker compose logs -f
# 或
docker logs -f hako
```

### 重启服务

```bash
docker compose restart
# 或
docker restart hako
```

### 重新生成 JWT_SECRET

```bash
# 删除 .env 文件，重启后会自动生成
docker exec hako rm /app/data/.env
docker restart hako
```

## 访问应用

启动后，在浏览器中访问：

- http://localhost:5678

默认登录凭证（首次启动后）：

- 用户名: admin
- 密码: admin123

⚠️ **重要**: 首次登录后请立即修改默认密码！
