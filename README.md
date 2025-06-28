# 📋 SMG CRM - Документація проекту

## 🎯 Загальний опис

**SMG CRM** - це повнофункціональна система управління взаємовідносинами з клієнтами, спеціально розроблена для автоматизації процесів інтернет-магазинів. Система інтегрується з WordPress сайтами та забезпечує автоматичне управління замовленнями, балансами користувачів, моніторингом цін та сервісів постачальників.

---

## 🏗️ Архітектура системи

```mermaid
graph TB
    subgraph "Фронтенд"
        UI[Веб-інтерфейс<br/>Bootstrap 5 + jQuery]
        API_UI[API Ендпоінти]
    end

    subgraph "Рівень додатка"
        Controllers[Контролери]
        Middleware[Проміжне ПЗ<br/>Auth, Roles, CORS]
        Services[Сервіси<br/>SiteAccess, Telegram]
    end

    subgraph "Бізнес-логіка"
        Models[Eloquent Моделі]
        Jobs[Черги<br/>ProcessOrder, ProcessFreeOrder]
        Events[Події та Слухачі]
    end

    subgraph "Дані"
        MySQL[(БД MySQL)]
        Files[Файлове сховище<br/>Іконки, логи]
    end

    subgraph "Зовнішні системи"
        WP[Сайти WordPress<br/>REST API]
        Suppliers[API Постачальників]
        Mono[Monobank API]
        TG[Telegram Bot]
    end

    subgraph "Інфраструктура"
        Cron[Крон-задачі<br/>Laravel Scheduler]
        Queue[Система черг<br/>Redis / БД]
        WebSocket[WebSocket сервер<br/>Оновлення в реальному часі]
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
        Admin[Адміністратор<br/>- Повний доступ<br/>- Налаштування системи<br/>- Користувачі]
        Manager[Менеджер<br/>- Управління сервісами<br/>- Статистика]
        User[Користувач<br/>- Замовлення<br/>- Продукти<br/>- Баланс]
    end

    subgraph "Контроль доступу"
        SiteAccess[Контроль доступу<br/>user_site_access]
        SiteGroups[Групи сайтів]
        DynamicAccess[Динамічний доступ<br/>SiteAccessService]
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
flowchart TB
    subgraph "Публічні маршрути"
        Login["/ - Сторінка входу"]
    end

    subgraph "Авторизовані"
        OrdersPage["/order - Замовлення"]
        FreeOrders["/free-orders - Безкоштовні замовлення"]
        Products["/products - Продукти"]
        Balance["/balance - Баланс"]
        UserSettings["/user/settings - Налаштування користувача"]
        Transactions["/transactions - Транзакції"]
    end

    subgraph "Менеджери + Адміністратори"
        ServiceStat["/service-stat - Моніторинг сервісів"]
        ServiceHistory["/service-stat-history - Історія змін"]
    end

    subgraph "Тільки адміністратори"
        Statistics["/statistics - Статистика"]
        GeneralSettings["/settings/general - Загальні налаштування"]
        ApiProviders["/settings/apies - API постачальники"]
        OrderStatuses["/settings/order-statuses - Статуси"]
        Currencies["/settings/currencies - Валюти"]
        Sites["/settings/sites - Сайти"]
        SiteGroups["/settings/site-groups - Групи"]
        Users["/users/list - Користувачі"]
        SupplierMapping["/settings/supplier - Співставлення API"]
        FreeOrderSettings["/settings/free-orders - Безкоштовні замовлення"]
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
    participant WP as Сайт WordPress
    participant API as CRM API
    participant DB as База даних
    participant Queue as Система черг
    participant Provider as Постачальник
    participant TG as Telegram

    WP->>API: POST /api/v1/createOrder
    API->>DB: Валідація + створення замовлення
    API->>DB: Перевірка email

    alt Підозрілий email
        API->>DB: Статус — 'pending'
        API->>TG: Повідомлення в Telegram
    else Звичайне замовлення
        API->>DB: Статус — 'launching'
        API->>Queue: Dispatch ProcessOrder
    end

    Queue->>Provider: Відправка до постачальника

    alt Успіх
        Provider->>Queue: Order ID
        Queue->>DB: Статус — 'executing'
    else Помилка
        Provider->>Queue: Error
        Queue->>DB: Статус — 'notaccepted'
        Queue->>TG: Повідомлення про помилку
    end

    API->>WP: Response
```

---

## 🔧 Автоматизовані процеси

```mermaid
gantt
    title Розклад Cron-завдань
    dateFormat HH:mm
    axisFormat %H:%M

    section Кожні 2 хв
    Обробка замовлень :active, proc1, 00:00, 00:02
    Очікування статусів :active, wait1, 00:00, 00:02
    Обробка помилок :active, note1, 00:00, 00:02

    section Кожні 10 хв
    Баланс API :active, bal1, 00:00, 00:10

    section Кожні 30 хв
    Ротація ключів Mono :active, mono1, 00:00, 00:30

    section Кожну годину
    Курси валют :active, curr1, 00:00, 01:00

    section Кожні 6 годин
    Оновлення сервісів :active, serv1, 00:00, 06:00
```

---

## 📡 API інтеграції

```mermaid
graph LR
    subgraph "CRM"
        CRM["CRM Система"]
    end

    subgraph "Сайти"
        WP1["WordPress Сайт 1"]
        WP2["WordPress Сайт 2"]
        WP3["WordPress Сайт N"]
    end

    subgraph "API зовнішні"
        Supplier1["Постачальник 1"]
        Supplier2["Постачальник 2"]
        Mono["Monobank API"]
        TG["Telegram Bot API"]
    end

    subgraph "WP API"
        GetServices["/wp-json/smgcrm/v1/get-services"]
        GetProducts["/wp-json/smgcrm/v1/get-products"]
        GetBalance["/wp-json/smgcrm/v1/get-user-balance"]
        SetBalance["/wp-json/smgcrm/v1/set-user-balance"]
        UpdateMono["/wp-json/smgcrm/v1/update-mono-api-key"]
    end

    subgraph "CRM API"
        CreateOrder["/api/v1/createOrder"]
        MonoGetKey["/api/v1/mono/get-api-key"]
        MonoUpdateKey["/api/v1/mono/update-api-key"]
        CreateFreeOrder["/api/v1/free-orders/create"]
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
    participant Cron as Крон
    participant CRM as CRM Система
    participant WP as WordPress Сайти
    participant API as API Постачальників
    participant TG as Telegram
    participant DB as БД

    Cron->>CRM: Запуск кожні 6 год
    CRM->>WP: GET /get-services
    WP->>CRM: Список сервісів

    CRM->>DB: Оновлення service_stat
    CRM->>API: Отримати ціни
    API->>CRM: Дані цін

    CRM->>DB: Порівняння

    alt Ціна змінилась
        CRM->>DB: Помітити is_changed
        CRM->>DB: Додати в історію
        CRM->>TG: Повідомлення
    end

    alt Сервіс недоступний
        CRM->>DB: Помітити is_not_service
        CRM->>DB: Додати в історію
        CRM->>TG: Повідомлення
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