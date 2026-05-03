# 智慧医疗管理系统 (Smart Medical)

一个基于前后端分离架构的智慧医疗管理系统，提供患者和医生两种角色，支持在线问诊、挂号、健康管理等核心功能。

## 功能特性

### 患者端
- 用户注册与登录
- 医生查询与预约挂号
- 健康记录管理（血压、血糖、体重等）
- 在线问诊聊天（实时消息）
- 病历查看
- 处方查看

### 医生端
- 医生注册与登录
- 今日挂号患者列表
- 患者签到管理
- 病历编辑与创建
- 处方的开具与管理
- 在线问诊聊天（实时消息）
- 医生主页信息管理

### 技术亮点
- 实时通信：基于 Socket.IO 的即时消息功能
- JWT 认证：安全的用户身份验证
- RESTful API：清晰的接口设计
- 响应式设计：适配多种设备

## 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vue Router** - 官方路由管理器
- **Pinia** - 状态管理库
- **Element Plus** - 基于 Vue 3 的组件库
- **Socket.IO Client** - 实时通信客户端
- **Axios** - HTTP 请求库

### 后端
- **Flask 3.0** - 轻量级 Web 框架
- **Flask-SQLAlchemy** - ORM 工具
- **Flask-JWT-Extended** - JWT 认证
- **Flask-SocketIO** - WebSocket 支持
- **Flask-CORS** - 跨域资源共享
- **PyMySQL** - MySQL 数据库驱动
- **bcrypt** - 密码加密

### 数据库
- **MySQL** - 关系型数据库

## 项目结构

```
smart-medical/
├── backend/                 # 后端服务
│   ├── app/
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # API 路由
│   │   ├── socket/         # WebSocket 事件
│   │   └── utils/          # 工具函数
│   ├── run.py              # 启动入口
│   └── requirements.txt    # Python 依赖
├── frontend/               # 前端应用
│   ├── css/               # 样式文件
│   ├── js/
│   │   ├── api.js         # API 封装
│   │   ├── stores/        # Pinia 状态管理
│   │   └── views/         # 页面组件
│   ├── lib/               # 第三方库
│   └── index.html         # 入口页面
└── README.md
```

## 快速开始

### 环境要求
- Python 3.8+
- Node.js 16+ (可选，前端已内置依赖)
- MySQL 5.7+ 或 MySQL 8.0+

### 1. 克隆项目
```bash
git clone https://github.com/kari-kari1/-smart-medical.git
cd smart-medical
```

### 2. 配置数据库

创建 MySQL 数据库：
```sql
CREATE DATABASE smart_medical CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

创建 `.env` 文件（可选）：
```env
# 数据库配置
SQLALCHEMY_DATABASE_URI=mysql+pymysql://username:password@localhost:3306/smart_medical

# JWT 密钥（请修改为随机字符串）
JWT_SECRET_KEY=your-secret-key-here
```

### 3. 安装后端依赖
```bash
cd backend
pip install -r requirements.txt
```

### 4. 启动后端服务
```bash
python run.py
```

后端启动后运行在 `http://127.0.0.1:5000`

### 5. 访问应用

打开浏览器访问 `http://127.0.0.1:5000`

## 默认账号

系统启动时会自动创建表结构。你可以注册新账号，或使用以下测试账号：

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 患者 | patient_test | test123 |
| 医生 | doctor_test | test123 |

> ⚠️ 测试账号需要在注册后手动创建

## API 文档

### 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/me` | 获取当前用户信息 |

### 患者接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/patients/profile` | 获取患者资料 |
| PUT | `/api/patients/profile` | 更新患者资料 |

### 医生接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/doctors` | 获取医生列表 |
| GET | `/api/doctors/profile` | 获取医生资料 |
| PUT | `/api/doctors/profile` | 更新医生资料 |

### 挂号接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/registrations` | 创建挂号 |
| GET | `/api/registrations` | 获取挂号记录 |
| PUT | `/api/registrations/<id>/checkin` | 患者签到 |

### 健康记录接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/health/records` | 创建健康记录 |
| GET | `/api/health/records` | 获取健康记录 |

### 处方接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/prescriptions` | 开具处方 |
| GET | `/api/prescriptions` | 获取处方列表 |

### 问诊接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/opinions` | 发起问诊 |
| GET | `/api/opinions` | 获取问诊列表 |

## WebSocket 事件

系统使用 Socket.IO 实现实时聊天功能：

| 事件名 | 方向 | 描述 |
|--------|------|------|
| `join` | 客户端→服务端 | 加入聊天房间 |
| `message` | 双向 | 发送聊天消息 |
| `new_message` | 服务端→客户端 | 接收新消息 |
| `typing` | 双向 | 对方正在输入... |

## 开发说明

### 前端开发
前端采用纯原生 JavaScript 编写，模块化组织。各页面组件定义在 `js/views/` 目录下，通过 Vue Router 统一管理路由。

### 后端开发
后端采用蓝图(Blueprint)模式组织代码，便于维护和扩展。各模块说明：

- `models/` - SQLAlchemy 数据模型
- `routes/` - API 路由处理
- `socket/` - WebSocket 事件处理
- `utils/` - 认证、加密等工具函数

### 数据库模型
- **User** - 用户表（患者、医生共用）
- **Patient** - 患者扩展信息
- **Doctor** - 医生扩展信息
- **Registration** - 挂号记录
- **HealthRecord** - 健康记录
- **Prescription** - 处方
- **Opinion** - 问诊记录
- **ChatMessage** - 聊天记录

## 许可证

本项目仅供学习和交流使用。

## 作者

[kari-kari1](https://github.com/kari-kari1)