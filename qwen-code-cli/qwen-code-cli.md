# Комплексный курс по Qwen Code CLI

> **Qwen Code CLI • Полный курс • Русская версия • Актуализировано 18.03.2026**

## О курсе

Этот документ — автономный русскоязычный курс по Qwen Code CLI: от первого запуска до продвинутых сценариев с MCP, skills, subagents, sandbox, headless automation, IDE и extensions.

| База | Официальные docs + GitHub repo + releases |
|------|-------------------------------------------|
| Версионный ориентир | Qwen Code v0.12.6 (stable ориентир на март 2026) |
| Формат | Самодостаточный HTML без внешних зависимостей |
| Для кого | От новичка до power user / CI / platform engineer |

**Теги:** Интерактивный CLI, Headless & CI, MCP, Skills, Subagents, LSP, Extensions, Sandbox

---

## 1. Что такое Qwen Code CLI и как устроен курс

### Что это

**Qwen Code** — агентный coding CLI для терминала. Он умеет понимать большие кодовые базы, запускать shell-команды, менять файлы, подключать внешние инструменты через MCP, а также работать как интерактивно, так и в headless/CI-сценариях.

### Когда использовать

- Онбординг в незнакомом репозитории
- Поиск и исправление бага
- Генерация тестов и документации
- Полуавтоматический code review
- Скриптовая проверка diff/логов/PR в CI
- Интеграция с IDE, MCP, extensions, skills и subagents

### Логика взаимодействия

У Qwen Code три основных слоя управления: обычный natural-language prompt, **slash-команды** для управления самим CLI и служебные префиксы **@** (контекст из файлов) и **!** (shell).

> ⚠️ **Важно про версии**
> 
> Qwen Code развивается быстро. В разных версиях могут слегка отличаться названия команд и поведение отдельных experimental-функций. В этом курсе отдельно отмечены места, где docs и исходники дают разные сигналы.

### Шпаргалка по сценариям

| Сценарий | Короткая шпаргалка |
|----------|-------------------|
| Первый запуск | `qwen` → `/auth` → `/help` → `/init` |
| Безопасный анализ без изменений | `qwen --approval-mode plan` |
| Headless one-shot | `qwen "Суммируй этот репозиторий"` |
| JSON для CI | `qwen -o json "Проверь diff на риски"` |
| Resume последней сессии | `qwen --continue` или `/resume` |
| Явное подключение файла | `@src/main.py Объясни логику` |
| Shell-команда внутри CLI | `!git status` |
| MCP server | `qwen mcp add --transport http my-server http://localhost:3000/mcp` |
| Skill | `~/.qwen/skills/my-skill/SKILL.md` + `/skills my-skill` |
| Subagent | `/agents create` |
| LSP | `qwen --experimental-lsp` |
| Sandbox | `qwen -s "run tests"` |

---

## 2. Быстрый старт: установка, первый запуск, базовый workflow

### Требования

Базовое требование — **Node.js 20+**. Практически всегда самый прямой способ установки — глобальный пакет npm.

```bash
# Требование: Node.js 20+
node -v

# Самый прямой путь установки
npm install -g @qwen-code/qwen-code@latest

# Запуск
qwen
```

### Первая продуктивная сессия

Ниже — минимальный, но реально полезный сценарий: авторизация, справка, инициализация проекта и построение карты репозитория.

```bash
qwen
/auth
/help
/init
@README.md @src/
Сделай карту проекта: архитектура, точки входа, тесты, риски и что читать первым.
```

> 💡 **Рекомендованный mental model**
> 
> Сначала дайте Qwen Code понять кодовую базу (`/init`, `@README`, ключевые каталоги), а уже потом просите менять код. Это снижает число ложных гипотез и экономит токены.

### Шаги

| Шаг | Действие |
|-----|----------|
| Шаг 1 | Запустите `qwen` и выполните `/auth` |
| Шаг 2 | Откройте `/help` и посмотрите `?` для keyboard shortcuts |
| Шаг 3 | В репозитории начните с `/init` и подключите ключевые файлы через `@` |

---

## 3. Аутентификация: OAuth, Coding Plan, API key и приоритет конфигурации

Qwen Code поддерживает несколько способов аутентификации. Для обучения и интерактивной работы удобно начать с OAuth. Для automation и CI обычно практичнее API key-путь с явным провайдером и endpoint-ом.

| Способ | Что это | Когда подходит |
|--------|---------|----------------|
| **Qwen OAuth** | Быстрый вход через браузер/аккаунт Qwen | Бесплатный старт, интерактивная работа, лимитированный free-tier |
| **Alibaba Cloud Coding Plan** | Платный endpoint от Alibaba Cloud | Команды/команды разработки, больше контроля и платные модели |
| **API key провайдера** | OpenAI-compatible, Anthropic, Gemini, Vertex и др. | Автоматизация, CI, кастомные endpoint-ы, локальные/совместимые серверы |

### Простой универсальный шаблон settings.json

```json
{
  "env": {
    "QWEN_CODE_BASE_URL": "https://api.example.com/v1",
    "QWEN_CODE_API_KEY": "YOUR_API_KEY"
  },
  "security": {
    "auth": {
      "selectedType": "openai"
    },
    "folderTrust": {
      "enabled": true
    }
  },
  "model": {
    "name": "your-model-name",
    "maxSessionTurns": -1,
    "chatCompression": {
      "contextPercentageThreshold": 0.7
    }
  },
  "ui": {
    "theme": "Dracula",
    "showLineNumbers": true,
    "showCitations": true
  },
  "permissions": {
    "defaultMode": "default"
  },
  "tools": {
    "sandbox": true
  },
  "modelProviders": {
    "openai": {
      "name": "OpenAI Compatible",
      "baseURL": "${QWEN_CODE_BASE_URL}",
      "envKey": "QWEN_CODE_API_KEY"
    }
  }
}
```

### Приоритет источников секретов

```bash
# Приоритет источников auth/секретов (упрощенно):
# 1) CLI flags
qwen --openai-api-key sk-... --openai-base-url https://api.example.com/v1

# 2) export в shell
export OPENAI_API_KEY=sk-...
export OPENAI_BASE_URL=https://api.example.com/v1

# 3) .qwen/.env или .env

# 4) settings.json -> env / provider config
```

> 💡 **Практическое правило**
> 
> Для интерактивного старта можно использовать OAuth. Для headless, CI и воспроизводимых команд лучше заранее настроить API key и provider config через `settings.json`, `.qwen/.env` или shell env.

### Полезные команды

| Команда | Описание |
|---------|----------|
| `/auth` | Открывает интерактивный flow смены способа аутентификации |
| `/model` | Переключает модель уже в текущей сессии |
| Project-specific secrets | Предпочтительно в `.qwen/.env`, а не в общем `.env` проекта |

---

## 4. Базовая модель работы: prompts, @-контекст, !-shell и хорошие инструкции

### Принципы хорошего prompt

| Принцип | Описание |
|---------|----------|
| **Хороший prompt** | Задача + контекст + ограничения + критерий готовности |
| **Контекст** | Подключайте только нужный контекст через `@` |
| **Верификация** | Сразу просите: «запусти тесты», «собери проект», «проверь линтер» |

### Примеры с @

Префикс `@` быстро подмешивает файл или директорию в контекст. Для путей с пробелами используйте экранирование.

```bash
@src/main.py Объясни назначение файла и основные зависимости.
@docs/ Суммируй документацию и найди пробелы.
@My\ Documents/design notes.md Составь краткое ТЗ.
```

### Примеры с !

`!` выполняет shell-команду. Если ввести одиночный `!` на пустой строке, вы войдете в shell mode.

```bash
!git status
!pytest -q
!
# дальше любой ввод считается shell-командой, пока не выйдете из shell mode
```

> ℹ️ **Важно**
> 
> Команды, выполненные через `!`, получают переменную окружения `QWEN_CODE=1`. Это удобно для скриптов, которым нужно понимать, что они вызваны из Qwen Code.

---

## 5. Полный разбор slash-команд

Slash-команды управляют самим CLI: сессией, интерфейсом, моделью, режимами доступа, extensions и служебными функциями.

| Команда | Описание | Пример |
|---------|----------|--------|
| `/init` | Разбирает текущую директорию и создает стартовый контекст проекта | `/init` |
| `/summary` | Генерирует сводку проекта/сессии на основе истории диалога | `/summary` |
| `/compress` | Сжимает историю чата в summary, чтобы экономить контекст | `/compress` |
| `/resume` | Возобновляет предыдущую сессию | `/resume` |
| `/restore` | Откатывает файлы к состоянию до инструментальных изменений | `/restore list` |
| `/clear` | Очищает экран терминала | `/clear` |
| `/theme` | Меняет тему интерфейса | `/theme` |
| `/vim` | Включает/выключает Vim-режим в поле ввода | `/vim` |
| `/directory` | Управляет multi-directory workspace | `/dir add ./src,./tests` |
| `/editor` | Выбор внешнего редактора для редактирования ввода/файлов | `/editor` |
| `/language` | Просмотр/изменение языковых настроек | `/language ui ru-RU` |
| `/mcp` | Показывает MCP-серверы и их инструменты | `/mcp` |
| `/tools` | Список доступных инструментов текущей сессии | `/tools` |
| `/skills` | Показывает навыки и позволяет вызвать Skill явно | `/skills excel-analysis` |
| `/approval-mode` | Переключает режим подтверждения действий | `/approval-mode auto-edit` |
| `/model` | Меняет модель текущей сессии | `/model` |
| `/extensions` | Управление расширениями в интерактивной сессии | `/extensions list` |
| `/memory` | Управляет инструкционным контекстом/памятью модели | `/memory add ...` |
| `/help` или `/?` | Открывает справку по командам | `/help` |
| `/about` | Показывает версию и сведения о сборке | `/about` |
| `/stats` | Статистика сессии: токены, инструменты, кэш и т.п. | `/stats` |
| `/settings` | Открывает редактор настроек | `/settings` |
| `/auth` | Смена/настройка способа аутентификации | `/auth` |
| `/bug` | Помогает отправить issue/репорт о проблеме | `/bug` |
| `/copy` | Копирует последний вывод в буфер | `/copy` |
| `/quit` или `/exit` | Завершает работу CLI | `/quit` |

> ℹ️ **Документированные команды вне основной таблицы**
> 
> Отдельные feature-страницы также описывают `/agents create`, `/agents manage`, `/lsp status` и команды управления trust.

---

## 6. @, ! и custom commands: как сделать Qwen Code удобнее именно под ваш workflow

### Custom commands: где лежат

Пользовательские команды можно хранить в `~/.qwen/commands/` и `<project>/.qwen/commands/`. Поддерживаются markdown-файлы с YAML frontmatter.

```bash
mkdir -p ~/.qwen/commands/git
cat > ~/.qwen/commands/git/commit.md <<'EOF'
---
description: Generate a commit message from staged changes
---
Please generate a concise Conventional Commit message for the staged diff below:
```diff
!{git diff --staged}
```
Requirements:
1. Output only the commit message
2. Keep subject under 72 characters
3. Prefer feat/fix/refactor/test/docs/chore
EOF

# Использование в Qwen Code:
/git:commit
```

### Динамические вставки внутри custom command

| Синтаксис | Описание |
|-----------|----------|
| `@{...}` | Подмешивает содержимое файла/ресурса |
| `!{...}` | Выполняет shell-команду и встраивает ее вывод |
| `{{args}}` | Подставляет аргументы, переданные пользователем команде |

```markdown
---
description: Review code against internal standards
---
Review {{args}} and use these references:
1. Standards:
@{docs/code-standards.md}
2. Current diff:
!{git diff --staged}
Return:
- critical issues
- recommended fixes
- missing tests
```

> 💡 **Когда стоит делать custom command**
> 
> Когда вы 3–5 раз формулировали один и тот же сложный prompt: security review, commit message, release notes, миграция, code review по внутреннему стандарту.

---

## 7. Headless mode и автоматизация: CI, скрипты, JSON-вывод, resume

Qwen Code можно использовать как интерактивного ассистента, а можно как скриптуемый CLI.

### Режимы работы

| Режим | Пример |
|-------|--------|
| Позиционный single-shot prompt | `qwen "Объясни структуру текущего репозитория"` |
| Документированный headless-флаг | `qwen -p "Проверь staged diff на breaking changes"` |
| Pipe через stdin | `git diff --staged \| qwen "Сгенерируй Conventional Commit message"` |
| JSON-вывод для CI | `qwen -o json "Проверь этот PR на security smells" > review.json` |
| Возобновление в headless | `qwen --continue -o json "Продолжи вчерашний план"` |
| Stream JSON | `qwen --input-format stream-json --output-format stream-json` |

> ⚠️ **Нюанс про `--prompt`**
> 
> Официальная документация по headless режиму активно показывает `-p/--prompt`, но в исходниках этот флаг уже помечен как deprecated в пользу позиционного prompt.

---

## 8. Approval modes: plan, default, auto-edit, yolo

Approval mode определяет, что Qwen Code может делать без вашего явного подтверждения.

| Режим | Что разрешено | Когда применять | Риск |
|-------|---------------|-----------------|------|
| `plan` | Только анализ, без shell и без правок | Разведка, аудит, незнакомый код | Минимальный |
| `default` | Правки и shell требуют подтверждения | Ежедневная безопасная работа | Низкий |
| `auto-edit` | Правки auto-approved, shell — по подтверждению | Когда доверяете изменениям в файлах | Средний |
| `yolo` | И shell, и правки auto-approved | Только в доверенной среде / песочнице | Высокий |

### Как переключать

- `/approval-mode <mode>`
- `--approval-mode` при запуске
- `Shift+Tab` (или `Tab` на Windows) — cycle режимов
- `--yolo` — shortcut в максимально permissive режим

```bash
# Старт сразу в безопасном режиме
qwen --approval-mode plan

# Быстрый режим для локального trusted-проекта
qwen --approval-mode auto-edit

# Максимально permissive режим
qwen --yolo
```

> 💡 **Практический совет**
> 
> Если репозиторий незнакомый — начинайте с `plan`. Если проект доверенный, но shell-команды вы хотите подтверждать вручную — используйте `auto-edit`.

---

## 9. Сессии, summary, compression и memory

У долгих диалогов есть две проблемы: контекст разрастается, а полезные инструкции теряются.

### Команды для управления контекстом

```bash
/memory add В этом репозитории тесты пишем на pytest, линтим ruff, форматируем black.
/summary
/compress
/resume
```

### Практика

- После большой исследовательской ветки — `/summary`
- Если диалог раздулся — `/compress`
- Для явных постоянных правил проекта — `/memory add ...`
- Чтобы вернуться позже — `/resume` или `qwen --continue`

> ℹ️ **Где это особенно полезно**
> 
> Рефакторинги на несколько часов, аудит больших репозиториев, серия маленьких фиксов в одной ветке, работа с несколькими подзадачами через subagents.

---

## 10. Конфигурация: settings.json, .env, precedence и важные категории настроек

Qwen Code поддерживает layered configuration.

### Приоритет источников (слабее → сильнее)

| Приоритет | Источник |
|-----------|----------|
| 1 | Hardcoded defaults |
| 2 | System defaults file |
| 3 | User settings file `~/.qwen/settings.json` |
| 4 | Project settings file `.qwen/settings.json` |
| 5 | System settings file |
| 6 | Environment variables / .env |
| 7 | CLI arguments |

### Основные файлы

- `~/.qwen/settings.json` — пользовательские настройки
- `.qwen/settings.json` — настройки проекта
- `~/.qwen/.env` и `.qwen/.env` — удобны для секретов
- `/etc/qwen-code/*` — для system-level overrides

### Что чаще всего настраивают

- `general` — редактор, vim mode, auto update
- `ui` — тема, line numbers, accessibility
- `model` — модель, maxSessionTurns, compression, generationConfig
- `security` — auth, trusted folders
- `tools` — sandbox и tool-related behavior

> 💡 **Подстановка env-переменных**
> 
> Строковые значения в `settings.json` могут ссылаться на переменные окружения как `$VAR` или `${VAR}`.

---

## 11. Модели и model providers: как выбрать провайдера без хаоса

| Провайдер / тип | Где уместен | Комментарий |
|-----------------|-------------|-------------|
| `qwen-oauth` | Быстрый старт без ручного ключа | Удобен для интерактивной работы и обучения |
| `openai` (OpenAI-compatible) | OpenAI-совместимые API, Azure OpenAI, vLLM, Ollama | Самый гибкий путь для automation |
| `anthropic` | Когда нужен провайдер Anthropic | Поддерживается как auth type |
| `gemini` | Google Gemini ecosystems | Есть отдельный auth type |
| `vertex-ai` | Enterprise / Google Cloud | Для пользователей Vertex AI |

### Ключевые моменты

- **OpenAI-compatible** — самый гибкий путь (OpenAI, Azure OpenAI, vLLM/Ollama)
- **Выбор модели на лету** — `/model` помогает менять модель без перезапуска сессии
- **Token caching** — для пользователей API-key auth есть автоматическая оптимизация

---

## 12. Sandbox и security controls: как уменьшить риск при shell и правках

Sandboxing изолирует опасные shell-команды и изменения файлов.

### Быстрый старт

```bash
# Быстрый старт с sandbox
qwen -s "run the test suite and explain failures"

# Явно выбрать контейнерный образ
qwen -s --sandbox-image ghcr.io/qwenlm/qwen-code:latest "audit this repository"

# Через переменную окружения
export GEMINI_SANDBOX=true
qwen "inspect the project and run unit tests"
```

### Продвинутые флаги окружения

```bash
# Podman + SELinux workaround
export SANDBOX_FLAGS="--security-opt label=disable"

# Ограничить сеть через локальный прокси
export GEMINI_SANDBOX_PROXY_COMMAND="python ./scripts/allowlist_proxy.py"

# Linux: как мапить UID/GID
export SANDBOX_SET_UID_GID=true
```

### Типы sandbox

| Тип | Описание |
|-----|----------|
| macOS Seatbelt | Легкий встроенный способ sandboxing на macOS |
| Docker/Podman | Кроссплатформенная контейнерная изоляция |
| Исторические env names | Некоторые переменные используют префикс `GEMINI_*` |

> 💡 **Надежная стратегия**
> 
> Для недоверенного репозитория комбинируйте: `--approval-mode plan/default` + `-s` + trusted folders.

---

## 13. MCP: подключение внешних инструментов, API и баз данных

MCP (Model Context Protocol) превращает внешние системы в инструменты, доступные Qwen Code.

### CLI-управление MCP

```bash
# HTTP MCP server
qwen mcp add --transport http my-server http://localhost:3000/mcp
qwen mcp list
qwen mcp remove my-server

# Stdio MCP server
qwen mcp add pythonTools \
  -e DATABASE_URL=$DB_CONNECTION_STRING \
  -e API_KEY=$EXTERNAL_API_KEY \
  --timeout 15000 \
  python -m my_mcp_server --port 8080

# SSE MCP server
qwen mcp add --transport sse sseServer http://localhost:8080/sse --timeout 30000
```

### Конфигурация через settings.json

```json
{
  "mcpServers": {
    "pythonTools": {
      "command": "python",
      "args": ["-m", "my_mcp_server", "--port", "8080"],
      "cwd": "./mcp-servers/python",
      "env": {
        "DATABASE_URL": "$DB_CONNECTION_STRING",
        "API_KEY": "${EXTERNAL_API_KEY}"
      },
      "timeout": 15000,
      "includeTools": ["safe_tool", "file_reader"],
      "trust": false
    }
  },
  "mcp": {
    "allowed": ["pythonTools"],
    "excluded": ["experimental-server"]
  }
}
```

### Transport типы

| Transport | Описание |
|-----------|----------|
| HTTP | Рекомендуемый вариант для удаленных/облачных серверов MCP |
| SSE | Legacy/совместимость со старыми реализациями |
| stdio | Лучший путь для локальных скриптов и CLI-утилит |

> ⚠️ **Безопасность MCP**
> 
> Не включайте `trust: true` без нужды. Ограничивайте surface через `includeTools`, `excludeTools`.

---

## 14. Skills: как упаковать повторяемую экспертизу в discoverable capability

Skill — это папка с `SKILL.md` и опциональными файлами. Главное отличие от slash-команд: Skills **автономно подбираются моделью**.

### Минимальный Skill

```bash
mkdir -p ~/.qwen/skills/excel-analysis
cat > ~/.qwen/skills/excel-analysis/SKILL.md <<'EOF'
---
name: excel-analysis
description: Analyze Excel spreadsheets, create summaries, charts, and pivot-style insights. Use when working with .xlsx files, spreadsheets, or tabular business reports.
---
# Excel Analysis
## Instructions
1. Inspect workbook structure.
2. Identify sheets, columns, and data quality issues.
3. Produce summary, trends, anomalies, and action items.
## Examples
- "Разбери sales-report.xlsx и найди просадки по регионам"
- "Сравни выручку по кварталам"
EOF
```

### Где хранить

- `~/.qwen/skills/` — personal skills
- `.qwen/skills/` — project skills
- skills из extensions — поставляются вместе с расширением

### Когда делать Skill

| Ситуация | Рекомендация |
|----------|--------------|
| Повторяющиеся задачи | PDF, Excel, release notes, SQL analysis, документация |
| Главное поле | `description` должно содержать «что делает» и «когда использовать» |
| Отладка | Если Skill не подхватывается, проверьте YAML и запустите с `--debug` |

---

## 15. Subagents: специализированные агенты с отдельным контекстом

Subagents — это автономные узкие агенты внутри Qwen Code с отдельным контекстом и ограниченным набором tools.

### Пример конфигурации

```bash
mkdir -p .qwen/agents
cat > .qwen/agents/testing-expert.md <<'EOF'
---
name: testing-expert
description: Writes comprehensive unit and integration tests. Use PROACTIVELY for requests about test coverage, regression testing, edge cases, or flaky tests.
tools:
- read_file
- write_file
- read_many_files
- run_shell_command
---
You are a testing specialist.
For each task:
1. Analyze dependencies and edge cases.
2. Add high-value tests first.
3. Run the smallest relevant test subset.
4. Report what was verified vs. what remains unverified.
EOF

# Затем в Qwen Code:
/agents create
```

### Ключевые свойства

- Отдельная история и контекст
- Контролируемый список tools
- Автономная работа до результата/ошибки
- Повторное использование между сессиями и проектами

| Команда | Описание |
|---------|----------|
| `/agents create` | Wizard для первого агента |
| `/agents manage` | Список и управление существующими конфигурациями |
| `description` | Можно писать `use PROACTIVELY` для агрессивной авто-делегации |

---

## 16. LSP: deep code intelligence поверх language servers

Experimental LSP support позволяет Qwen Code пользоваться семантической навигацией и диагностикой.

### Включение и установка серверов

```bash
# Включить LSP
qwen --experimental-lsp

# Установить language servers
npm install -g typescript-language-server typescript
pip install python-lsp-server
# Go
go install golang.org/x/tools/gopls@latest
```

### Пример .lsp.json

```json
{
  "typescript": {
    "command": "typescript-language-server",
    "args": ["--stdio"],
    "extensionToLanguage": {
      ".ts": "typescript",
      ".tsx": "typescriptreact",
      ".js": "javascript",
      ".jsx": "javascriptreact"
    },
    "startupTimeout": 10000,
    "shutdownTimeout": 5000,
    "restartOnCrash": true,
    "maxRestarts": 3,
    "trustRequired": true
  },
  "python": {
    "command": "pylsp",
    "extensionToLanguage": {
      ".py": "python"
    }
  }
}
```

### Возможности LSP

- go to definition
- find references
- hover/type info
- diagnostics
- code actions
- call hierarchy

> ⚠️ **Нюанс доверия**
> 
> LSP servers по умолчанию запускаются только в trusted workspaces.

---

## 17. Extensions: поставка MCP + skills + agents + commands одним пакетом

Extensions — это переносимый формат для доставки возможностей в Qwen Code.

### CLI и runtime управление

```bash
# Установка extension из git/GitHub
qwen extensions install owner/repo

# Локальная разработка extension
qwen extensions install /path/to/your/extension

# Управление
qwen extensions list
qwen extensions disable my-extension --scope=workspace
qwen extensions enable my-extension --scope=workspace
qwen extensions update --all

# Runtime внутри интерактивной сессии
/extensions list
/extensions install owner/repo
/extensions detail my-extension
```

### Структура qwen-extension.json

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "mcpServers": {
    "my-server": {
      "command": "node my-server.js"
    }
  },
  "contextFileName": "QWEN.md",
  "commands": "commands",
  "skills": "skills",
  "agents": "agents",
  "settings": [
    {
      "name": "API Key",
      "description": "API key for external service",
      "envVar": "MY_API_KEY",
      "sensitive": true
    }
  ]
}
```

### Ключевые моменты

- Совместимость с extension ecosystems Gemini CLI и Claude Code Marketplace
- По умолчанию Qwen Code ищет extensions в `~/.qwen/extensions`
- У extensions есть собственные значения настроек и секретов

---

## 18. IDE-интеграции и GitHub Actions

### VS Code (Beta)

Есть расширение для VS Code: sidebar, история диалогов, multiple sessions, attach файлов/изображений. Требуется VS Code 1.85+.

### Zed через ACP

```json
{
  "assistant": {
    "version": "2",
    "default_model": {
      "provider": "copilot_chat",
      "model": "gpt-4.1"
    },
    "agent_servers": {
      "Qwen Code": {
        "type": "custom",
        "command": "qwen",
        "args": ["--acp"],
        "env": {}
      }
    }
  }
}
```

### JetBrains через ACP

```json
{
  "name": "Qwen Code",
  "command": "qwen",
  "args": ["--acp"]
}
```

### GitHub Actions

- Хранить `QWEN_API_KEY` в secrets
- Вызывать qwen-code-action для review/triage/automation
- При необходимости запускать `/setup-github` из репозитория

---

## 19. Языки, темы, accessibility, .qwenignore, trusted folders, shortcuts

### Язык и тема

```bash
/language ui ru-RU
/language output Russian
/theme
/settings
```

Встроенные UI-языки: `zh-CN`, `en-US`, `ru-RU`, `de-DE`, `ja-JP` (и алиасы).

### .qwenignore

```bash
# Игнорировать каталог целиком
/packages/

# Игнорировать секреты
apikeys.txt
.env

# Игнорировать все markdown-файлы, кроме README
*.md
!README.md
```

### Темы

ANSI, Atom One, Ayu, Dracula, GitHub, а также light-варианты: ANSI Light, Ayu Light, GitHub Light, Google Code, Xcode и др.

### Keyboard Shortcuts

| Shortcut | Что делает |
|----------|------------|
| `?` в пустой строке | Показать список shortcut-ов |
| `!` в пустой строке | Войти/выйти из shell mode |
| `Esc` | Закрыть диалоги/панели |
| `Ctrl/Cmd+C` | Отменить запрос и очистить ввод; повторно — выход |
| `Ctrl+D` | Выйти, если строка ввода пуста |
| `Ctrl/Cmd+L` | Очистить экран |
| `Ctrl+O` | Переключить debug console |
| `Ctrl+S` | Отключить truncation и показать длинный вывод полностью |
| `Ctrl/Cmd+T` | Показать/скрыть описания tools |
| `Shift+Tab` (или `Tab` на Windows) | Цикл режимов approval |
| `Ctrl+X` / `Meta+Enter` | Открыть текущий ввод во внешнем редакторе |
| `Ctrl+G` | В IDE integration показать контекст из IDE |
| `\` в конце строки + Enter | Перенос строки без отправки prompt |
| `↑` | История команд/запросов |
| `Ctrl/Cmd+Z` | Undo в поле ввода |
| `Ctrl/Cmd+Shift+Z` | Redo в поле ввода |

---

## 20. Практические сценарии: от онбординга до CI

### Онбординг в новый репозиторий

```bash
qwen
/init
@README.md @src/ @tests/
Сделай onboarding-план на 30 минут, 2 часа и 1 день.
```

### Безопасный аудит без изменений

```bash
qwen --approval-mode plan "Найди потенциальные security smells в этом репозитории"
```

### Исправление бага с верификацией

```bash
@src/auth.ts @tests/auth.test.ts
Найди причину flaky-падения логина, предложи минимальный патч, обнови тесты и запусти только релевантный набор.
```

### Commit message из staged diff

```bash
git diff --staged | qwen "Сгенерируй Conventional Commit message. Выведи только subject line."
```

### PR review в JSON для CI

```bash
qwen -o json "Проверь изменения на breaking changes, security issues и missing tests" > review.json
```

### Генерация документации

```bash
/summary
@src/api/ @README.md
Сгенерируй draft API reference и TODO-список, что еще нужно документировать.
```

### Multi-directory workspace

```bash
/dir add ../shared-lib,./src,./tests
Сравни локальный код и shared-lib, найди несовместимости интерфейсов.
```

### MCP к базе/внутреннему API

```bash
qwen mcp add --transport http analytics http://localhost:3000/mcp
qwen
/mcp
С помощью analytics сравни выручку по регионам за Q1 и Q2.
```

### Skill для повторяемой экспертизы

```bash
mkdir -p .qwen/skills/log-analysis
# добавьте SKILL.md
# затем просите: "Разбери server.log и найди 5 вероятных причин роста 500 ошибок"
```

### Subagent для тестов

```bash
/agents create
Пусть testing-expert добавит регрессионные тесты для платежного модуля.
```

### LSP-навигация в большом проекте

```bash
qwen --experimental-lsp
/lsp status
Найди все references для функции createSession и опиши цепочку вызовов.
```

### Sandbox для недоверенного кода

```bash
qwen -s --approval-mode default "Исследуй этот репозиторий и запусти тесты"
```

### Extension для команды/компании

```bash
qwen extensions install owner/repo
/extensions detail company-toolkit
```

### Resume и compression

```bash
/summary
/compress
/resume
```

### Миграция базы данных

```bash
@prisma/schema.prisma @migrations/
Проанализируй текущую схему, предложи миграцию для добавления soft delete ко всем моделям,
сгенерируй SQL и проверь обратную совместимость.
```

### Генерация Dockerfile и CI-пайпплайна

```bash
@package.json @tsconfig.json
Сгенерируй multi-stage Dockerfile (build + production), .dockerignore
и GitHub Actions workflow для сборки и пуша в ghcr.io.
```

### Release notes из git log

```bash
git log --oneline v1.2.0..HEAD | qwen "Сгруппируй по категориям (feat/fix/refactor/docs),
напиши release notes на русском в формате Keep a Changelog."
```

### Рефакторинг монорепозитория

```bash
/init
@src/ @packages/
Предложи план разделения src/utils на отдельный пакет packages/shared-utils:
зависимости, breaking changes, порядок миграции и тесты.
```

### Сравнение двух веток / PR

```bash
git diff main...feature/payments -- '*.ts' | qwen "Проанализируй этот diff:
1) breaking changes 2) security risks 3) непокрытые тестами пути
4) предложи вопросы для code review"
```

### Анализ производительности

```bash
@lighthouse-report.json @src/pages/
Разбери отчёт Lighthouse, найди 5 худших метрик,
предложи конкретный код-фикс для каждого и оцени ожидаемый прирост.
```

### Автоматизация i18n / локализации

```bash
@src/components/ @locales/en.json
Найди все хардкоженные строки UI на английском в компонентах,
вынеси в locales/en.json и создай locales/ru.json с переводами.
```

### Отладка CI-пайплайна

```bash
@.github/workflows/ci.yml
!cat /tmp/ci-log-latest.txt
Проанализируй лог падения CI: найди root cause, предложи фикс для workflow
и объясни, как предотвратить повторение.
```

---

## 21. Troubleshooting: самые частые проблемы и как их чинить

| Проблема | Решение |
|----------|---------|
| CLI не видит нужную auth-конфигурацию | Проверьте порядок приоритета: CLI flags → shell env → `.qwen/.env` → `settings.json` |
| Skill не активируется автоматически | Проблема в расплывчатом `description` в `SKILL.md`. Запустите `qwen --debug` |
| MCP показывает Disconnected | Проверьте URL/command, увеличьте `timeout`, посмотрите `qwen mcp list` |
| LSP не стартует | Проверьте наличие language server в PATH, включите `--experimental-lsp` |
| Sandbox ломается на Linux/Podman | Для SELinux: `SANDBOX_FLAGS="--security-opt label=disable"` |
| Проект ведет себя как untrusted | Включите Trusted Folders в user settings |
| Слишком длинный контекст | Используйте `/summary`, `/compress`, настройте `contextPercentageThreshold` |
| Файлы пропали из поля зрения | Проверьте `.qwenignore`. После изменения файла перезапустите сессию |

---

## 22. Приложения и справочники

### A. Slash-команды (полная таблица)

См. раздел 5 выше.

### B. Дополнительные команды

| Команда | Где/зачем используется |
|---------|------------------------|
| `/agents create` | Пошаговое создание subagent-а через wizard |
| `/agents manage` | Управление существующими subagents |
| `/lsp status` | Показать настроенные и запущенные LSP-серверы |
| `/permissions` | Открывает диалог доверия для текущей папки |
| `/trust` | Пометить workspace как trusted |
| `/setup-github` | Помощник для настройки GitHub Actions-интеграции |

### C. CLI flags и advanced options

#### Промпт и сессия

| Флаг | Описание |
|------|----------|
| `[query...]` | Позиционный запрос (предпочтительный способ) |
| `-p, --prompt` | Явный prompt для headless (deprecated) |
| `-i, --prompt-interactive` | Открыть интерактивную сессию с заданным prompt |
| `-m, --model` | Задать модель при старте |
| `--system-prompt` | Полностью переопределить системный prompt |
| `--append-system-prompt` | Добавить инструкции к системному prompt |
| `-c, --continue` | Продолжить последнюю сессию проекта |
| `-r, --resume <sessionId>` | Открыть конкретную сессию по идентификатору |

#### Формат I/O

| Флаг | Описание |
|------|----------|
| `-o, --output-format` | text\|json\|stream-json |
| `--input-format` | text\|stream-json |
| `--include-partial-messages` | Добавлять частичные сообщения в поток JSON |

#### Безопасность и исполнение

| Флаг | Описание |
|------|----------|
| `-s, --sandbox` | Включить sandbox |
| `--sandbox-image` | Контейнерный образ для sandbox |
| `--approval-mode` | plan\|default\|auto-edit\|yolo |
| `-y, --yolo` | Короткий флаг для максимально permissive режима |
| `--checkpointing` | Включить checkpointing сессии |
| `--allowed-tools` | Разрешенный список tools |
| `--exclude-tools` | Запретить часть tools |

#### Интеграции

| Флаг | Описание |
|------|----------|
| `--acp` | Запуск в ACP-режиме для IDE/редакторов |
| `--experimental-lsp` | Включить experimental LSP support |
| `--extensions` | Работа с расширениями при запуске |
| `-l, --list-extensions` | Показать расширения |
| `--screen-reader` | Режим повышенной доступности |

#### Логирование/отладка

| Флаг | Описание |
|------|----------|
| `-d, --debug` | Отладочный режим |
| `--openai-logging` | Логирование OpenAI-compatible API вызовов |
| `--chat-recording` | Запись/логирование чата |
| `--telemetry` | Управление телеметрией |

#### Аутентификация/веб

| Флаг | Описание |
|------|----------|
| `--auth-type` | openai / anthropic / qwen-oauth / gemini / vertex-ai |
| `--openai-api-key` | Передать API key через CLI |
| `--openai-base-url` | Переопределить OpenAI-compatible endpoint |
| `--tavily-api-key` | Ключ для web-search интеграции |
| `--google-api-key` | Google API key для web search |

### D. Keyboard shortcuts

См. раздел 19 выше.

### E. Шаблоны файлов

См. соответствующие разделы выше (settings.json, .qwenignore, .lsp.json, SKILL.md, subagent, custom command, qwen-extension.json).

### F. Что особенно важно запомнить

1. Начинайте с безопасного режима и только потом повышайте автономность
2. `@` и четкий prompt важнее «магии» модели
3. Для повторяемых задач делайте custom commands, Skills и subagents
4. Для automation используйте headless + JSON + стабильную auth-конфигурацию
5. Для внешних систем — MCP; для глубокой навигации по коду — LSP

---

## 23. Источники и база актуальности

Курс собран по официальной документации Qwen Code, официальному GitHub-репозиторию и актуальным release notes.

### Основные ссылки

- [Официальная документация Qwen Code](https://qwenlm.github.io/qwen-code-docs/en/)
- [Quickstart](https://qwenlm.github.io/qwen-code-docs/en/users/quickstart/)
- [Commands](https://qwenlm.github.io/qwen-code-docs/en/users/features/commands/)
- [Headless Mode](https://qwenlm.github.io/qwen-code-docs/en/users/features/headless/)
- [Settings](https://qwenlm.github.io/qwen-code-docs/en/users/configuration/settings/)
- [Authentication](https://qwenlm.github.io/qwen-code-docs/en/users/configuration/authentication/)
- [MCP](https://qwenlm.github.io/qwen-code-docs/en/users/features/mcp/)
- [Sandbox](https://qwenlm.github.io/qwen-code-docs/en/users/features/sandbox/)
- [Skills](https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/)
- [Subagents](https://qwenlm.github.io/qwen-code-docs/en/users/features/sub-agents/)
- [LSP](https://qwenlm.github.io/qwen-code-docs/en/users/features/lsp/)
- [Extensions](https://qwenlm.github.io/qwen-code-docs/en/users/extension/introduction/)
- [Trusted Folders](https://qwenlm.github.io/qwen-code-docs/en/users/configuration/trusted-folders/)
- [Ignoring Files (.qwenignore)](https://qwenlm.github.io/qwen-code-docs/en/users/configuration/qwen-ignore/)
- [GitHub repository](https://github.com/QwenLM/qwen-code)
- [GitHub releases](https://github.com/QwenLM/qwen-code/releases)

> ℹ️ **Почему в курсе есть оговорки**
> 
> У быстро развивающихся CLI иногда расходятся общая страница команд, feature-страницы и фактические флаги в исходниках. Поэтому в спорных местах курс явно отмечает нюансы.

---

## Совет по изучению

> 💡 **Совет:** сначала пройдите разделы 1–8, затем выберите один продвинутый трек: **MCP**, **Headless/CI**, **Skills/Subagents** или **LSP/IDE**. Так материал усвоится значительно быстрее, чем если читать файл строго линейно до конца.