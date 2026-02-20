# NestJS Homework Project

## 📌 Опис проєкту
Цей репозиторій містить базовий NestJS-проєкт, створений як фундамент для подальшої розробки серверного застосунку.


## 🛠 Технології
- **Node.js**: LTS версія  
- **NestJS**: фреймворк для побудови серверних застосунків
- **TypeScript**: основна мова розробки
- **dotenv / ConfigModule**: робота з environment variables


## 📂 Структура проєкту
src/
├─ main.ts # Точка входу, налаштування ValidationPipe та глобальних ExceptionFilter

├─ app.module.ts # Головний модуль

├─ users/ # UsersModule — окремий feature-модуль

│ ├─ users.module.ts # Декларація та експорт залежностей

│ ├─ users.controller.ts # Обробка HTTP-запитів

│ ├─ users.service.ts # Бізнес-логіка

## ⚙️ Конфігурація середовища
Для роботи з конфігурацією використовується `@nestjs/config` з глобальним доступом.


### Файли середовища:
- `.env.local` — локальне середовище  
- `.env.dev` — dev середовище  
- `.env.prod` — production середовище  
- `.env.example` — приклад змінних середовища 


## ▶️ Запуск проєкту
```bash
npm install
```

```bash
npm run start:dev
```

Застосунок буде доступний за адресою: http://localhost:PORT
GraphQL playground буде доступний за адресою: http://localhost:PORT/graphql


## 🧠 Бачення
- Модульність — кожна бізнес-область виділена в окремий модуль
- Масштабованість — легко додавати нові feature-модулі
- Типізація — TypeScript забезпечує безпечну роботу з даними
- Конфігурація середовища — централізована та зрозуміла структура


### Concurrency & Data Consistency

- Oversell protection is implemented using pessimistic locking.
- Product rows are locked inside a database transaction before stock updates
- This guarantees consistency under concurrent requests and prevents overselling
- All write operations are executed inside a transaction with: automatic rollback on error and guaranteed queryRunner release

### Error Handling & Idempotency
- 409 Conflict is returned when there is insufficient stock
(business rule violation)
- Duplicate idempotencyKey requests return the existing order
(idempotent behavior)
- Transaction safety ensures no partial writes or leaked connections

### Performance Optimization
! EXPLAIN ANALYZE was executed before and after index creation to validate query performance.
Hot query identified: order listing with filters and multiple JOINs, heavily used in the admin panel.
Optimization applied:
- Added a composite index: orders (status, created_at DESC)
- This optimizes:
  - - filtering by order status
  - - sorting by creation date (latest first)

## SQL Optimization: orders query

### EXPLAIN ANALYZE (before index):
Limit  (cost=13.01..13.02 rows=1 width=310) (actual time=3.871..3.873 rows=2 loops=1)
  ->  Sort  (cost=13.01..13.02 rows=1 width=310) (actual time=3.869..3.870 rows=2 loops=1)
        Sort Key: created_at DESC
        Sort Method: quicksort  Memory: 25kB
        ->  Seq Scan on orders  (cost=0.00..13.00 rows=1 width=310) (actual time=0.029..0.029 rows=2 loops=1)
              Filter: (status = 'CREATED'::orders_status_enum)
Planning Time: 4.354 ms
Execution Time: 6.584 ms

### EXPLAIN ANALYZE (after index):
Limit  (cost=1.03..1.04 rows=1 width=310) (actual time=0.039..0.040 rows=2 loops=1)
  ->  Sort  (cost=1.03..1.04 rows=1 width=310) (actual time=0.038..0.039 rows=2 loops=1)
        Sort Key: created_at DESC
        Sort Method: quicksort  Memory: 25kB
        ->  Seq Scan on orders  (cost=0.00..1.02 rows=1 width=310) (actual time=0.015..0.016 rows=2 loops=1)
              Filter: (status = 'CREATED'::orders_status_enum)
Planning Time: 4.494 ms
Execution Time: 0.071 ms

- **Execution Time зменшився**:  ~ у 93 рази (6.584 → 0.071 ms)
- **Estimated cost зменшився**: (13 → 1)

## GraphQL Integration
У проєкті підключено GraphQL через @nestjs/graphql та Apollo Driver. Використано підхід code-first, тому що він дозволяє описувати GraphQL-схему прямо в TypeScript-класах через декоратори (@ObjectType, @Field тощо). Це зручно, оскільки не потрібно створювати окремі .graphql файли — схема генерується автоматично. Такий підхід добре поєднується з NestJS і TypeORM та спрощує підтримку й розширення проєкту.

## Pagination & Filtering (Orders Connection)
Для запиту orders обрано формат OrdersConnection { data, totalCount }. Це забезпечує кращий UX та гнучкість API порівняно з поверненням простого масиву.
Чому обрано цей підхід:
- Поле totalCount дозволяє фронтенду обчислити кількість сторінок без додаткових запитів до БД.
- Структура-обгортка дозволяє додавати нові поля (наприклад, pageInfo).
- Розділення фільтрації та пагінації через @InputType зберігає резолвер «тонкими».

## N+1 та DataLoader
**Щоб перевірити наявність проблеми N+1:**
- logging: true у TypeOrmModule.
- Виконали GraphQL-запит
query {
  orders {
    id
    items {
      id
      product {
        id
        title
      }
    }
  }
}
- У консолі: 
SELECT * FROM orders LIMIT 100;
SELECT * FROM order_items WHERE order_id = '0ad057d1-6dca-...';
SELECT * FROM products WHERE id = 'a26fc917-8ea1-...';
SELECT * FROM products WHERE id = '15360d99-ff5c-...';
SELECT * FROM order_items WHERE order_id = '22222222-2222-...';
SELECT * FROM products WHERE id = 'a26fc917-8ea1-...';
SELECT * FROM products WHERE id = '15360d99-ff5c-...';
...

**Після DataLoader (optimized)**
SELECT DISTINCT ... FROM orders LEFT JOIN order_items ... LEFT JOIN users ... LIMIT 100;
SELECT * FROM products WHERE id IN ('a26fc917-8ea1-...', '15360d99-ff5c-...', '75cf1b7e-affe-...', 'b613925c-eb59-...');
