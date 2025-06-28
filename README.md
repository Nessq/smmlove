# 📋 SMG CRM - Документація проекту

## 🎯 Загальний опис

**SMG CRM** - це повнофункціональна система управління взаємовідносинами з клієнтами, спеціально розроблена для автоматизації процесів інтернет-магазинів. Система інтегрується з WordPress сайтами та забезпечує автоматичне управління замовленнями, балансами користувачів, моніторингом цін та сервісів постачальників.

---

## 🏗️ Архітектура системи

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Web Interface<br/>Bootstrap 5 + jQuery]
        API_UI[API Endpoints]
    end
    
    subgraph "Application Layer"
        Controllers[Controllers]
        Middleware[Middleware<br/>Auth, Roles, CORS]
        Services[Services<br/>SiteAccess, Telegram]
    end
    
    subgraph "Business Logic"
        Models[Eloquent Models]
        Jobs[Queue Jobs<br/>ProcessOrder, ProcessFreeOrder]
        Events[Events & Listeners]
    end
    
    subgraph "Data Layer"
        MySQL[(MySQL Database)]
        Files[File Storage<br/>Icons, Logs]
    end
    
    subgraph "External Systems"
        WP[WordPress Sites<br/>REST API]
        Suppliers[API Providers<br/>External Services]
        Mono[Monobank API]
        TG[Telegram Bot]
    end
    
    subgraph "Infrastructure"
        Cron[Cron Jobs<br/>Laravel Scheduler]
        Queue[Queue System<br/>Redis/Database]
        WebSocket[WebSocket Server<br/>Real-time updates]
    end
    
    UI --> Controllers
    API_UI --> Controllers
    Controllers --> Middleware
    Controllers --> Services
    Controllers --> Models
    Models --> MySQL
    Jobs --> Queue
    Jobs --> Suppliers
    Services --> WP
    Services --> TG
    Cron --> Jobs
    Controllers --> WebSocket
    Models --> Mono
```

---

## 🗄️ Схема бази даних

```mermaid
erDiagram
    users {
        bigint id PK
        string name
        string email UK
        string password
        string role
        text managed_sites
        timestamp created_at
        timestamp updated_at
    }
    
    sites {
        int id PK
        string url
        string name
        int currency_id FK
        bigint site_group_id FK
        string icon
        boolean mono_rotation_active
        timestamp created_at
        timestamp updated_at
    }
    
    site_groups {
        bigint id PK
        string name
        string description
        timestamp created_at
        timestamp updated_at
    }
    
    user_site_access {
        bigint id PK
        bigint user_id FK
        bigint site_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    orders {
        bigint id PK
        datetime date
        string wp_order_number
        string supplier_order_number
        string product_service
        int quantity
        string url
        string telegram
        text url_site
        decimal total_amount
        string client_email
        string status
        string api_type
        string supplier_id
        string supplier_service_id
        text notes
        int remains
        boolean remains_status
        boolean is_archive
        decimal provider_price
        int site_id FK
        int currency_id FK
        string type_payment
        timestamp created_at
        timestamp updated_at
    }
    
    free_orders {
        bigint id PK
        string email
        string ip
        string user_agent
        string category_identifier
        string order_number
        string social_link
        string status
        int quantity
        int site_id FK
        text notes
        timestamp created_at
        timestamp updated_at
    }
    
    free_order_mappings {
        bigint id PK
        string category_identifier UK
        string category_name
        string supplier_id
        string supplier_service_id
        int quantity
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    currencies {
        int id PK
        string name
        string code
        string symbol
        decimal exchange_rate
        timestamp created_at
        timestamp updated_at
    }
    
    api_providers {
        bigint id PK
        string name
        string api_key
        string login
        string password
        string api_url
        boolean api_check
        float api_balance
        boolean api_send_tg
        float trigger_price
        timestamp created_at
        timestamp updated_at
    }
    
    supplier_api_mappings {
        bigint id PK
        string supplier_id
        bigint api_provider_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    service_stat {
        int id PK
        int site_id FK
        bigint api_provider_id FK
        int product_id
        int service_id
        longtext data
        boolean is_changed
        boolean is_not_service
        int parent_product_id
        string product_name
        timestamp created_at
        timestamp updated_at
    }
    
    service_stat_history {
        int id PK
        longtext text
        boolean is_view
        timestamp created_at
        timestamp updated_at
    }
    
    mono_keys_rotation {
        bigint id PK
        int site_id FK
        json api_keys
        int current_key_index
        string current_key
        int rotation_interval
        datetime rotation_start_time
        datetime last_rotation_time
        boolean rotation_active
        boolean mono_pause_cron
        string wp_endpoint_url
        json key_comments
        timestamp created_at
        timestamp updated_at
    }
    
    history_transaction {
        bigint id PK
        bigint wp_user_id
        string email
        decimal amount
        decimal balance
        bigint user_by_id FK
        datetime date
        timestamp created_at
        timestamp updated_at
    }
    
    order_statuses {
        bigint id PK
        string status_value UK
        string name
        string color
        timestamp created_at
        timestamp updated_at
    }
    
    settings {
        bigint id PK
        string key
        mediumtext value
        timestamp created_at
        timestamp updated_at
    }
    
    users ||--o{ user_site_access : "has access to"
    sites ||--o{ user_site_access : "accessible by"
    site_groups ||--o{ sites : "contains"
    currencies ||--o{ sites : "uses"
    currencies ||--o{ orders : "priced in"
    sites ||--o{ orders : "generates"
    sites ||--o{ free_orders : "receives"
    sites ||--o{ service_stat : "monitored on"
    sites ||--o{ mono_keys_rotation : "has rotation"
    api_providers ||--o{ supplier_api_mappings : "mapped to"
    api_providers ||--o{ service_stat : "provides"
    users ||--o{ history_transaction : "performed by"
    free_order_mappings ||--o{ free_orders : "mapped by category"
    order_statuses ||--o{ orders : "has status"
    order_statuses ||--o{ free_orders : "has status"
```

---

## 👥 Система ролей та доступу

```mermaid
graph TD
    subgraph "Ролі користувачів"
        Admin[Administrator<br/>- Повний доступ<br/>- Налаштування системи<br/>- Управління користувачами]
        Manager[Manager<br/>- Управління сервісами<br/>- Перегляд статистики<br/>- Обмежений доступ]
        User[User<br/>- Замовлення<br/>- Продукти<br/>- Баланси]
    end
    
    subgraph "Контроль доступу"
        SiteAccess[Site Access Control<br/>user_site_access]
        SiteGroups[Site Groups<br/>Проекти]
        DynamicAccess[Dynamic Access<br/>SiteAccessService]
    end
    
    subgraph "Ресурси"
        Sites[Сайти]
        Orders[Замовлення]
        Products[Продукти]
        Balance[Баланси]
        Stats[Статистика]
        Settings[Налаштування]
    end
    
    Admin --> Settings
    Admin --> Stats
    Admin --> SiteGroups
    Manager --> Stats
    Manager --> Orders
    User --> Orders
    User --> Products
    User --> Balance
    
    SiteAccess --> Sites
    SiteGroups --> Sites
    DynamicAccess --> SiteAccess
    Sites --> Orders
    Sites --> Products
    Sites --> Balance
```

---

## 🌐 Структура сторінок та маршрутизація

```mermaid
graph TB
    subgraph "Публічні маршрути"
        Login[/ - Login Page]
    end
    
    subgraph "Авторизовані користувачі"
        OrdersPage[/order - Управління замовленнями]
        FreeOrders[/free-orders - Безкоштовні замовлення]
        Products[/products - Продукти]
        Balance[/balance - Гаманці]
        UserSettings[/user/settings - Налаштування користувача]
        Transactions[/transactions - Транзакції]
    end
    
    subgraph "Менеджери + Адміністратори"
        ServiceStat[/service-stat - Моніторинг сервісів]
        ServiceHistory[/service-stat-history - Історія змін]
    end
    
    subgraph "Тільки адміністратори"
        Statistics[/statistics - Статистика]
        GeneralSettings[/settings/general - Загальні налаштування]
        ApiProviders[/settings/apies - API постачальники]
        OrderStatuses[/settings/order-statuses - Статуси замовлень]
        Currencies[/settings/currencies - Валюти]
        Sites[/settings/sites - Сайти]
        SiteGroups[/settings/site-groups - Проекти]
        Users[/users/list - Користувачі]
        SupplierMapping[/settings/supplier - Співставлення API]
        FreeOrderSettings[/settings/free-orders - Налаштування безкоштовних замовлень]
    end
    
    Login --> OrdersPage
    OrdersPage --> FreeOrders
    OrdersPage --> Products
    OrdersPage --> Balance
    OrdersPage --> UserSettings
    OrdersPage --> Transactions
    OrdersPage --> ServiceStat
    ServiceStat --> ServiceHistory
    OrdersPage --> Statistics
    Statistics --> GeneralSettings
    GeneralSettings --> ApiProviders
    GeneralSettings --> OrderStatuses
    GeneralSettings --> Currencies
    GeneralSettings --> Sites
    GeneralSettings --> SiteGroups
    GeneralSettings --> Users
    GeneralSettings --> SupplierMapping
    GeneralSettings --> FreeOrderSettings
```

---

## 🔄 Потік обробки замовлень

```mermaid
sequenceDiagram
    participant WP as WordPress Site
    participant API as CRM API
    participant DB as Database
    participant Queue as Queue System
    participant Provider as API Provider
    participant TG as Telegram
    
    WP->>API: POST /api/v1/createOrder
    API->>DB: Validate & Create Order
    API->>DB: Check suspicious email
    
    alt Suspicious Email
        API->>DB: Set status to 'pending'
        API->>TG: Send suspicious email notification
    else Normal Order
        API->>DB: Set status to 'launching'
        API->>Queue: Dispatch ProcessOrder Job
    end
    
    Queue->>Provider: Send order to supplier
    
    alt Success Response
        Provider->>Queue: Return order number
        Queue->>DB: Update status to 'executing'
    else Error Response
        Provider->>Queue: Return error
        Queue->>DB: Update status to 'notexepted'
        Queue->>TG: Send error notification
    end
    
    API->>WP: Return response
```

---

## 🔧 Автоматизовані процеси

```mermaid
gantt
    title Cron Jobs Schedule
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Every 2 minutes
    Process Orders     :active, proc1, 00:00, 00:02
    Check Waiting Status :active, wait1, 00:00, 00:02
    Check Notexcepted   :active, note1, 00:00, 00:02
    
    section Every 10 minutes
    Check API Balance   :active, bal1, 00:00, 00:10
    
    section Every 30 minutes
    Rotate Mono Keys    :active, mono1, 00:00, 00:30
    
    section Every Hour
    Update Currencies   :active, curr1, 00:00, 01:00
    
    section Every 6 hours
    Update Services     :active, serv1, 00:00, 06:00
```

---

## 📡 API інтеграції

```mermaid
graph LR
    subgraph "SMG CRM"
        CRM[CRM System]
    end
    
    subgraph "WordPress Sites"
        WP1[Site 1<br/>WordPress]
        WP2[Site 2<br/>WordPress]
        WP3[Site N<br/>WordPress]
    end
    
    subgraph "External APIs"
        Supplier1[Supplier API 1]
        Supplier2[Supplier API 2]
        Mono[Monobank API]
        TG[Telegram API]
    end
    
    subgraph "WordPress API Endpoints"
        GetServices[/wp-json/smgcrm/v1/get-services/]
        GetProducts[/wp-json/smgcrm/v1/get-products]
        GetBalance[/wp-json/smgcrm/v1/get-user-balance/]
        SetBalance[/wp-json/smgcrm/v1/set-user-balance/]
        UpdateMono[/wp-json/smgcrm/v1/update-mono-api-key]
    end
    
    subgraph "CRM API Endpoints"
        CreateOrder[/api/v1/createOrder]
        MonoGetKey[/api/v1/mono/get-api-key]
        MonoUpdateKey[/api/v1/mono/update-api-key]
        CreateFreeOrder[/api/v1/free-orders/create]
    end
    
    CRM <--> WP1
    CRM <--> WP2
    CRM <--> WP3
    CRM --> Supplier1
    CRM --> Supplier2
    CRM <--> Mono
    CRM --> TG
    
    WP1 --> GetServices
    WP1 --> GetProducts
    WP1 --> GetBalance
    WP1 --> SetBalance
    WP1 --> UpdateMono
    
    CRM --> CreateOrder
    CRM --> MonoGetKey
    CRM --> MonoUpdateKey
    CRM --> CreateFreeOrder
```

---

## 🔄 Система ротації Monobank ключів

```mermaid
flowchart TD
    Start([Cron Job Start<br/>Every 30 minutes]) --> CheckRotation{Check if rotation<br/>is needed}
    
    CheckRotation -->|No| End([End])
    CheckRotation -->|Yes| GetCurrentSite[Get Site with<br/>active rotation]
    
    GetCurrentSite --> GetNextKey[Get next API key<br/>from rotation list]
    GetNextKey --> UpdateCRM[Update current_key<br/>in CRM database]
    UpdateCRM --> CallWP[Call WordPress API<br/>to update key]
    
    CallWP --> WPSuccess{WordPress<br/>update success?}
    WPSuccess -->|Yes| LogSuccess[Log successful<br/>rotation]
    WPSuccess -->|No| LogError[Log rotation<br/>error]
    
    LogSuccess --> UpdateTime[Update last_rotation_time]
    LogError --> UpdateTime
    UpdateTime --> NextSite{More sites<br/>to process?}
    
    NextSite -->|Yes| GetCurrentSite
    NextSite -->|No| End
    
    subgraph "Rotation Settings"
        RotationInterval[Rotation Interval<br/>in hours]
        RotationActive[Rotation Active<br/>boolean flag]
        StartTime[Rotation Start Time]
        PauseCron[Pause Cron<br/>flag]
    end
```

---

## 📊 Моніторинг сервісів та цін

```mermaid
sequenceDiagram
    participant Cron as Cron Job
    participant CRM as CRM System
    participant WP as WordPress Sites
    participant API as Supplier APIs
    participant TG as Telegram
    participant DB as Database
    
    Cron->>CRM: Every 6 hours: service:update
    CRM->>WP: GET /wp-json/smgcrm/v1/get-services/
    WP->>CRM: Return services list
    
    CRM->>DB: Update/Create service_stat records
    CRM->>API: Request current prices
    API->>CRM: Return price data
    
    CRM->>DB: Compare with previous prices
    
    alt Price Changed
        CRM->>DB: Mark as is_changed
        CRM->>DB: Insert into service_stat_history
        CRM->>TG: Send price change notification
    end
    
    alt Service Not Available
        CRM->>DB: Mark as is_not_service
        CRM->>DB: Insert into service_stat_history
        CRM->>TG: Send unavailable service notification
    end
```

---

## 🎯 Ключові особливості системи

### 1. **Багатосайтова архітектура**
- Централізоване управління множиною WordPress сайтів
- Роздільні доступи користувачів до різних сайтів
- Групування сайтів у проекти для зручного управління

### 2. **Автоматизація замовлень**
- Автоматичне створення замовлень через API
- Асинхронна обробка через систему черг Laravel
- Автоматичні сповіщення в Telegram про статуси

### 3. **Моніторинг цін та сервісів**
- Автоматичне відстеження змін цін у постачальників
- Сповіщення про недоступні сервіси
- Історія всіх змін з можливістю перегляду

### 4. **Система безкоштовних замовлень**
- Окрема система для обробки безкоштовних послуг
- Контроль лімітів за IP та email
- Мапінг категорій на конкретні сервіси

### 5. **Інтеграція з Monobank**
- Автоматична ротація API ключів
- Синхронізація з WordPress сайтами
- Логування всіх операцій

### 6. **Real-time оновлення**
- WebSocket з'єднання для миттєвих оновлень
- Pusher інтеграція для real-time сповіщень

---

## 🛠️ Технічний стек

### **Backend**
- **Framework:** Laravel 10.x
- **PHP:** 8.1+
- **Database:** MySQL/MariaDB
- **Queue:** Redis/Database driver
- **WebSockets:** Laravel WebSockets + Pusher

### **Frontend**
- **CSS Framework:** Bootstrap 5.3.2
- **JavaScript:** jQuery + Axios
- **Build Tool:** Vite
- **Icons:** Bootstrap Icons + Font Awesome

### **DevOps & Infrastructure**
- **Task Scheduling:** Laravel Cron
- **Process Management:** Supervisor (for queues)
- **Logging:** Laravel Log (Monolog)
- **Caching:** Redis/File cache

### **External Integrations**
- **Payment Processing:** Monobank API
- **Notifications:** Telegram Bot API
- **CMS Integration:** WordPress REST API
- **Service Providers:** Various Supplier APIs

---

## 📈 Можливості для розширення

### **Короткострокові покращення**
1. **Dashboard аналітики** - розширена статистика з графіками
2. **API документація** - автоматична генерація документації
3. **Експорт звітів** - PDF/Excel звіти
4. **Мобільна версія** - адаптивний дизайн для мобільних пристроїв

### **Довгострокові можливості**
1. **Multi-tenancy** - повна ізоляція даних між клієнтами
2. **Machine Learning** - прогнозування попиту та оптимізація цін
3. **Microservices** - розділення на окремі сервіси
4. **Advanced Analytics** - Business Intelligence інструменти

---

## 📋 Використання документації

Ця документація містить Mermaid діаграми, які можна візуалізувати за допомогою:

1. **GitHub/GitLab** - автоматичний рендеринг Mermaid діаграм
2. **Mermaid Live Editor** - https://mermaid.live/
3. **VS Code** - з плагіном Mermaid Preview
4. **Notion, Obsidian** - підтримують Mermaid діаграми
5. **Draw.io** - можна імпортувати Mermaid код

Для кращого розуміння архітектури рекомендується переглянути всі діаграми в інтерактивному режимі. 