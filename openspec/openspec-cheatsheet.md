# OpenSpec — шпаргалка для .NET-проектов

## Установка и инициализация

```bash
# Глобальная установка CLI
npm install -g @fission-ai/openspec@latest

# Инициализация в существующем репозитории (.NET-проект)
cd my-dotnet-app
openspec init
# → выберите AI-ассистента (Claude Code, Cursor, Codex и т.д.)

# Обновить конфиги после апгрейда CLI
openspec update
```

После `openspec init` появляется структура:

```
openspec/
├── project.md          # tech stack, конвенции проекта
├── AGENTS.md           # managed hand-off для AI-ассистентов
├── specs/              # source of truth (текущее поведение системы)
│   └── <domain>/
│       └── spec.md
└── changes/            # предложенные изменения (по одной папке на change)
    └── <change-name>/
        ├── proposal.md
        ├── design.md
        ├── tasks.md
        └── specs/      # delta-спецификации
            └── <domain>/
                └── spec.md
```

---

## Создание мастер-спеки в существующем проекте (brownfield)

OpenSpec **не имеет** встроенной команды для автогенерации спек из существующего кода.
Мастер-спека создаётся вручную через `explore` + `propose`.

### Шаг 1. Изучить кодовую базу

```
/opsx:explore проанализируй структуру проекта, ключевые домены и поведение системы
```

> Explore — режим обсуждения. Ничего не пишет, только исследует код и помогает сформулировать план.

### Шаг 2. Сформировать начальные спеки как change

```
/opsx:propose document-existing-behavior
```

> Агент создаст change-папку с proposal.md, delta-спеками (ADDED Requirements) и tasks.md.
> Просмотрите и скорректируйте артефакты перед продолжением.

### Шаг 3. Применить и заархивировать — спеки станут source of truth

```
/opsx:apply
/opsx:sync
/opsx:archive
```

> После `archive` delta-спеки мерджатся в `openspec/specs/` — это и есть ваша мастер-спека.

### Альтернатива: вручную создать project.md

```bash
# Отредактируйте openspec/project.md — опишите tech stack и конвенции
# Пример содержимого для .NET-проекта:
```

```markdown
# Project: MyApi

## Tech Stack
- .NET 8, ASP.NET Core, C# 12
- PostgreSQL, Dapper
- Docker Compose, Kafka
- xUnit, FluentAssertions

## Conventions
- Все эндпоинты возвращают ProblemDetails при ошибках
- Иммутабельные DTO через records
- Валидация через FluentValidation
```

---

## Базовый рабочий цикл (core profile)

```
/opsx:propose ──► /opsx:apply ──► /opsx:sync ──► /opsx:archive
```

| Команда       | Действие                                    |
|---------------|---------------------------------------------|
| `/opsx:explore` | Обсуждение идеи, анализ кода. Ничего не пишет. |
| `/opsx:propose` | Создаёт change-папку: proposal.md, specs/, design.md, tasks.md |
| `/opsx:apply`   | Реализует задачи из tasks.md, пишет код        |
| `/opsx:verify`  | Проверяет, что код соответствует спекам (опционально) |
| `/opsx:sync`    | Мерджит delta-спеки в основную спецификацию     |
| `/opsx:archive` | Переносит change в `changes/archive/` с датой   |

---

## Короткие промты для типовых задач в .NET

### Добавление новой фичи

```
/opsx:propose add-rate-limiting
```

```
/opsx:propose добавить middleware для rate limiting на эндпоинты контроллеров
```

### Изменение существующего поведения

```
/opsx:propose change-jwt-to-reference-tokens
```

```
/opsx:propose заменить JWT на reference tokens, обновить AuthHandler
```

### Добавление эндпоинта

```
/opsx:propose add-orders-export-endpoint
```

### Рефакторинг

```
/opsx:propose refactor-repository-to-dapper
```

```
/opsx:propose перевести OrderRepository с EF Core на Dapper
```

### Добавление интеграции

```
/opsx:propose add-kafka-order-events
```

### Исправление бага

```
/opsx:propose fix-concurrent-update-race-condition
```

---

## CLI-команды

```bash
# Список активных и архивных изменений
openspec list

# Список спецификаций
openspec list --specs

# Показать содержимое change
openspec show <change-id>

# Строгая валидация структуры change
openspec validate <change-id> --strict

# Интерактивный дашборд
openspec view

# Архивировать завершённый change
openspec archive <change-id> --yes

# Архивировать без валидации (для tooling-only changes)
openspec archive <change-id> --skip-specs --yes

# Сменить профиль workflow (включить расширенный)
openspec config profile
openspec update
```

---

## Структура delta-спеки

Delta-спеки описывают **только что меняется**, а не всю систему целиком:

```markdown
# Delta for Auth

## ADDED Requirements

### Requirement: Two-Factor Authentication
Система MUST поддерживать TOTP-аутентификацию.

#### Scenario: 2FA enrollment
- GIVEN пользователь без 2FA
- WHEN включает 2FA в настройках
- THEN отображается QR-код для настройки
- AND требуется подтверждение кодом

## MODIFIED Requirements

### Requirement: Session Expiration
Система MUST истекать сессию через 15 минут бездействия.
(Ранее: 30 минут)

#### Scenario: Idle timeout
- GIVEN аутентифицированная сессия
- WHEN прошло 15 минут без активности
- THEN сессия аннулируется

## REMOVED Requirements

### Requirement: Remember Me
(Устарело в пользу 2FA)
```

| Секция                  | Что происходит при archive      |
|--------------------------|---------------------------------|
| `## ADDED Requirements`  | Добавляется в основную спеку    |
| `## MODIFIED Requirements` | Заменяет существующее требование |
| `## REMOVED Requirements` | Удаляется из основной спеки     |

---

## Расширенный профиль (expanded)

```
/opsx:new ──► /opsx:ff или /opsx:continue ──► /opsx:apply ──► /opsx:verify ──► /opsx:archive
```

| Команда         | Назначение                                    |
|-----------------|-----------------------------------------------|
| `/opsx:new`     | Начать change (вместо propose)                 |
| `/opsx:ff`      | Сгенерировать все артефакты за один шаг       |
| `/opsx:continue`| Создавать артефакты инкрементально             |
| `/opsx:verify`  | Проверить соответствие кода спекам             |

---

## Практические советы для .NET

1. **project.md** — пропишите tech stack (.NET версия, БД, ORM, контейнеризацию). Агент будет учитывать это в каждом change.

2. **Домены = bounded contexts** — организуйте `specs/` по доменам:
   ```
   openspec/specs/
   ├── auth/spec.md
   ├── orders/spec.md
   ├── payments/spec.md
   └── notifications/spec.md
   ```

3. **Спеки — это контракты поведения, не планы реализации.** Не пишите в spec.md названия классов или библиотек. Реализация — в `design.md` и `tasks.md`.

4. **Change ID — kebab-case, глагол в начале:** `add-`, `update-`, `fix-`, `refactor-`, `remove-`.

5. **Валидируйте перед apply:**
   ```bash
   openspec validate <change-id> --strict
   ```

6. **После каждого завершённого change — archive**, чтобы delta-спеки мерджились в `openspec/specs/`.

---

## Типовой сценарий: добавление фичи в существующий .NET-проект

```bash
# 1. (опционально) Обсудить подход
/opsx:explore как лучше добавить кэширование ответов OrdersController

# 2. Создать change с артефактами
/opsx:propose add-orders-response-caching

# 3. Проверить структуру
openspec validate add-orders-response-caching --strict

# 4. Реализовать
/opsx:apply

# 5. Проверить соответствие (опционально)
/opsx:verify

# 6. Мерджить спеки и заархивировать
/opsx:sync
/opsx:archive
```

