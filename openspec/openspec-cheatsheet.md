---
layout: default
---

# OpenSpec

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
├── config.yaml          # project context: tech stack, конвенции (поле context:)
├── specs/              # source of truth (текущее поведение системы)
│   └── <domain>/
│       └── spec.md
└── changes/            # предложенные изменения (по одной папке на change)
    └── <change-name>/
        ├── .openspec.yaml   # метаданные change (schema, дата создания)
        ├── proposal.md
        ├── design.md
        ├── tasks.md
        └── specs/      # delta-спецификации
            └── <domain>/
                └── spec.md
```

Дополнительно `init` настраивает конфиги выбранных инструментов — например
`.claude/skills`, `.cursor/commands`, `.agents/skills` и т.п. Свой tech stack и
конвенции проекта прописываются в `openspec/config.yaml` (поле `context:`) —
только там, и OpenSpec их не перезаписывает.

> Источник: https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md#openspec-init

---

## Работа в существующем проекте (brownfield)

OpenSpec не автогенерирует спеки из существующего кода — и это осознанный выбор.
**Не нужно документировать всю кодовую базу целиком.** Спеки пишутся только для
того поведения, которое вы собираетесь менять: каждый change фиксирует свой
срез, и со временем `specs/` заполняются вокруг реальной работы. Заполнять
спеку задним числом (backfill) официально не рекомендуется.

### Типовой первый цикл

```
/opsx:explore ──► /opsx:propose ──► /opsx:apply ──► /opsx:archive
```

1. **Изучить кодовую базу** (`/opsx:explore`) — режим обсуждения, ничего не пишет, помогает понять выбранную область и сформулировать план.
2. **Создать change** (`/opsx:propose add-<что-то>`) — предложите реальное небольшое изменение, которое нужно в этой области в любом случае, а не абстрактное «задокументировать».
3. **Реализовать** (`/opsx:apply`) и **заархивировать** (`/opsx:archive`) — после archive delta-спеки мерджатся в `openspec/specs/`.

Для guided-обучающего цикла на вашем коде есть расширенная команда `/opsx:onboard`
(включается через `openspec config profile` + `openspec update`).

### Куда записать tech stack и конвенции

```yaml
# openspec/config.yaml
context: |
  Tech Stack:
  - .NET 8, ASP.NET Core, C# 12
  - PostgreSQL, Dapper
  - Docker Compose, Kafka
  - xUnit, FluentAssertions

  Conventions:
  - Все эндпоинты возвращают ProblemDetails при ошибках
  - Иммутабельные DTO через records
  - Валидация через FluentValidation
```

> Источник: https://github.com/Fission-AI/OpenSpec/blob/main/docs/existing-projects.md

---

## Базовый рабочий цикл (core profile)

```
/opsx:explore ──► /opsx:propose ──► /opsx:apply ──► /opsx:sync ──► /opsx:archive
  (опционально)
```

| Команда         | Действие                                    |
|-----------------|---------------------------------------------|
| `/opsx:explore` | Обсуждение идеи, анализ кода. Ничего не пишет. |
| `/opsx:propose` | Создаёт change-папку: proposal.md, specs/, design.md, tasks.md |
| `/opsx:apply`   | Реализует задачи из tasks.md, пишет код        |
| `/opsx:update`  | Правка и согласование артефактов планирования (код не трогает) |
| `/opsx:sync`    | Мерджит delta-спеки в основную спецификацию (опционально) |
| `/opsx:archive` | Переносит change в `changes/archive/` с датой; сам предложит sync при необходимости |

> `sync` — опциональная команда: `archive` предложит синхронизацию, если дельты
> ещё не смёрджины.

> Источник: https://github.com/Fission-AI/OpenSpec/blob/main/docs/commands.md#quick-reference

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

> Источник: https://github.com/Fission-AI/OpenSpec/blob/main/docs/commands.md#opsxpropose

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

# Создать change метаданные вручную
openspec new change <change-id>

# Статус артефактов change
openspec status --change <change-id>

# Архивировать завершённый change
openspec archive <change-id> --yes

# Архивировать без валидации (для tooling-only changes)
openspec archive <change-id> --skip-specs --yes

# Сменить профиль workflow (включить расширенный)
openspec config profile
openspec update
```

> Источник: https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md

---

## Структура delta-спеки

Delta-спеки описывают только **то, что изменится**, а не всю систему целиком.
При создании новой capability delta-спека открывается секцией `## Purpose`
(пара предложений о назначении).

```markdown
# Delta for Auth

## Purpose

Аутентификация и управление сессиями пользователей.

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

| Секция                    | Что происходит при archive      |
|---------------------------|---------------------------------|
| `## ADDED Requirements`   | Добавляется в основную спеку    |
| `## MODIFIED Requirements`| Заменяет существующее требование |
| `## REMOVED Requirements` | Удаляется из основной спеки     |

> `sync` также распознаёт `RENAMED`-секции; спека — это контракт поведения
> (RFC 2119: `MUST`/`SHALL`, `SHOULD`, `MAY`), без планов реализации.

> Источник: https://github.com/Fission-AI/OpenSpec/blob/main/docs/writing-specs.md

---

## Расширенный профиль (expanded)

Включается так:

```bash
openspec config profile
openspec update
```

```
/opsx:new ──► /opsx:ff или /opsx:continue ──► /opsx:apply ──► /opsx:verify ──► /opsx:archive
```

| Команда           | Назначение                                    |
|-------------------|-----------------------------------------------|
| `/opsx:new`       | Начать change (вместо propose)                 |
| `/opsx:ff`        | Сгенерировать все артефакты за один шаг       |
| `/opsx:continue`  | Создавать артефакты инкрементально             |
| `/opsx:verify`    | Проверить соответствие кода спекам             |
| `/opsx:bulk-archive` | Архивация нескольких changes сразу          |
| `/opsx:onboard`   | Обучающий цикл через реальную кодовую базу    |

> Источник: https://github.com/Fission-AI/OpenSpec/blob/main/docs/commands.md#expanded-workflow-commands-custom-workflow-selection

---

## Практические советы для .NET

1. **`config.yaml` → `context:`** — пропишите tech stack (.NET версия, БД, ORM, контейнеризацию). Агент будет учитывать это в каждом change.

2. **Домены = bounded contexts** — организуйте `specs/` по доменам (capability):
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

6. **Не заполняйте спеки задним числом.** Спеки растут по одному change вокруг реальной работы и не устаревают.

7. **После каждого завершённого change — archive**, чтобы delta-спеки мерджились в `openspec/specs/`.

> Источники: https://github.com/Fission-AI/OpenSpec/blob/main/docs/writing-specs.md · https://github.com/Fission-AI/OpenSpec/blob/main/docs/existing-projects.md

---

## Типовой сценарий: добавление фичи в существующий .NET-проект

```bash
# 1. (опционально) Обсудить подход
/opsx:explore как лучше добавить кэширование ответов OrdersController

# 2. Создать изменения с артефактами
/opsx:propose add-orders-response-caching

# 3. Проверить структуру
openspec validate add-orders-response-caching --strict

# 4. Реализовать
/opsx:apply

# 5. Проверить соответствие (опционально, только в расширенном профиле)
/opsx:verify

# 6. Мерджить дельта спеки в основную спеку (опционально;
#    archive сам предложит sync при необходимости)
/opsx:sync

# 7. Заархивировать завершенные изменения
/opsx:archive
```

> Источник: https://github.com/Fission-AI/OpenSpec/blob/main/docs/workflows.md