---
layout: default
---

# Tilt

## Что такое Tilt

[Tilt](https://tilt.dev/) — инструмент для разработки микросервисных приложений на Kubernetes и Docker Compose. Автоматизирует цикл: отслеживание изменений в файлах -> сборка образов -> деплой в кластер. Замена ручному циклу `docker build && kubectl apply` или `docker-compose up`.

**Control Loop:** Tiltfile регистрирует ресурсы (образы + YAML). Tilt engine выполняет их и отслеживает изменения. При изменении файла — пересборка и деплой затрагиваемого ресурса.

> Источник: [Tilt.dev](https://tilt.dev/) · [The Control Loop](https://docs.tilt.dev/controlloop.html)

## Установка

**Для Linux** перед установкой Tilt потребуется подготовить окружение:

- **Docker** — установить и настроить [запуск без root](https://docs.docker.com/install/linux/linux-postinstall/)
- **kubectl** — [установить](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- **ctlptl** + **Kind** — создать локальный кластер с registry
- **Альтернатива:** [Microk8s](https://microk8s.io/) для Ubuntu

Далее — установка Tilt:

```bash
# curl
curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash

# Проверка
tilt version
```

> Источник: [Install Tilt](https://docs.tilt.dev/install.html)

## Базовый сценарий

```
project/
├── api/
│   ├── src/
│   │   └── ...
│   ├── Dockerfile
│   └── mycompany.api.sln
├── web/
│   ├── src/
│   │   └── ...
│   ├── package.json
│   └── Dockerfile
├── k8s/
│   └── deploy.yaml
└── Tiltfile
```

Минимальный Tiltfile на Starlark для проекта с .NET Core API и TypeScript/Node.js фронтендом:

```python
# Deploy: указать YAML-манифесты
k8s_yaml('k8s/deploy.yaml')

# Build: собрать образы
docker_build('mycompany/api', './api')    # .NET Core / ASP.NET
docker_build('mycompany/web', './web')    # TypeScript / Node.js

# Watch: проброс портов (опционально)
k8s_resource('api', port_forwards=5000)
k8s_resource('web', port_forwards=3000)
```

Запуск:

```bash
tilt up        # запустить окружение, открыть Web UI на localhost:10350
tilt down      # остановить ресурсы (k8s и docker-compose)
```

Tilt автоматически перезапускает Tiltfile при его изменении. Web UI показывает состояние всех ресурсов, логи и порты.

> Источник: [Writing Your First Tiltfile](https://docs.tilt.dev/tiltfile_authoring.html) · [Launching & Managing Resources](https://docs.tilt.dev/tutorial/2-tilt-up.html) · [Tilt UI](https://docs.tilt.dev/tutorial/3-tilt-ui.html)

## Tiltfile API

Tiltfile пишется на Starlark. Ключевые функции:

| Функция | Назначение | Пример |
|---|---|---|
| `docker_build(ref, context)` | Сборка Docker-образа | `docker_build('mycompany/api', './api')` |
| `k8s_yaml(path)` | Деплой YAML-манифестов | `k8s_yaml('k8s/deploy.yaml')` |
| `k8s_resource(name, port_forwards)` | Настройка ресурса (порты, зависимости, labels) | `k8s_resource('api', port_forwards='5000')` |
| `docker_compose(path)` | Запуск Docker Compose сервисов | `docker_compose('./docker-compose.yml')` |
| `local_resource(name, cmd, serve_cmd)` | Локальные команды/серверы | `local_resource('frontend', cmd='npm run build', deps=['web/package.json'])` |
| `custom_build(ref, command, deps)` | Кастомная сборка образа | `custom_build('mycompany/api', 'docker build -t $EXPECTED_REF ./api', ['./api'])` |
| `helm(chart_dir)` | Рендеринг Helm-чарта | `k8s_yaml(helm('./charts/api'))` |
| `kustomize(dir)` | Рендеринг Kustomize | `k8s_yaml(kustomize('./overlays/dev'))` |
| `local(cmd)` | Выполнить shell-команду на хосте | `k8s_yaml(local('./gen_config.py'))` |
| `load(ext, ...)` | Загрузить расширение | `load('ext://deployment', 'deployment_create')` |
| `read_file(path)` | Зафиксировать зависимость от файла | `read_file('config/base.yaml')` |
| `default_registry(host)` | Переопределить registry для образов | `default_registry('ghcr.io/mycompany')` |

> Источник: [Tiltfile API Reference](https://docs.tilt.dev/api.html)

## CLI-команды

| Команда | Действие |
|---|---|
| `tilt up` | Запустить окружение, открыть Web UI |
| `tilt up -- <service>` | Запустить только указанные сервисы |
| `tilt ci` | CI-режим: build -> deploy -> ждёт готовности -> exit(0) или ошибка |
| `tilt down` | Удалить k8s и Docker Compose ресурсы |
| `tilt logs <resource>` | Логи конкретного ресурса |
| `tilt args` | Просмотр/изменение аргументов Tiltfile |
| `tilt trigger <resource>` | Ручной триггер пересборки ресурса |
| `tilt version` | Версия Tilt |
| `tilt doctor` | Диагностика окружения |
| `tilt dump` | Дамп состояния Tilt engine |

> Источник: [Tilt CLI Reference](https://docs.tilt.dev/cli/tilt.html) · [tilt up](https://docs.tilt.dev/cli/tilt_up.html)

## Live Update

Быстрое обновление работающего контейнера без полной пересборки образа. Обновления — секунды вместо минут.

```python
# .NET Core: dotnet watch перезапускает приложение при изменении кода
docker_build('mycompany/api', './api', live_update=[
    sync('./api/src', '/app/src'),
    run('dotnet watch run'),
])

# TypeScript: ts-node/nodemon для автоматического рестарта
docker_build('mycompany/web', './web', live_update=[
    sync('./web/src', '/app/src'),
    run('npm run dev'),
    run('npm install', trigger='./web/package.json'),   # переустановка зависимостей
])
```

Порядок шагов Live Update:
1. `initial_sync()` — полная синхронизация всех файлов при первом запуске контейнера
2. `fall_back_on(files)` — при изменении этих файлов выполняется полная пересборка, а не Live Update
3. `sync(local, remote)` — синхронизировать файлы в контейнер
4. `run(cmd, trigger)` — выполнить команду в контейнере (с опциональным триггером)

При изменении файла:

- Если файл совпадает с любым из файлов в шаге `fall_back_on` — выполняется полная пересборка + деплой (обычный процесс, без live update).
- Иначе, если файл совпадает с любым локальным путём в шагах `sync` — выполняется live update:
  1. Скопировать изменившиеся файлы согласно шагам `sync`
  2. Для каждого шага `run`:
     - если у `run` указаны `trigger` — выполнить команду, только если изменившиеся файлы совпадают с триггерами
     - иначе — выполнить команду безусловно

> Источник: [Live Update Reference](https://docs.tilt.dev/live_update_reference.html)

## CI

```bash
tilt ci
```

`tilt ci` выполняет однопроходный цикл:
1. Исполняет Tiltfile
2. Запускает все `local_resource`
3. Собирает все образы
4. Деплоит все Kubernetes-ресурсы
5. Ждёт, пока все сервисы не станут healthy
6. exit(0) — успех, exit(1) — ошибка

```python
# Tiltfile: настройки CI для .NET Core + TypeScript сборки
ci_settings(
    timeout='30m',
    readiness_timeout='5m',
)

docker_build('mycompany/api', './api')
docker_build('mycompany/web', './web')
k8s_yaml('deploy.yaml')
```

Для CI рекомендуется разворачивать одноразовый Kind-кластер с локальным registry.

> Источник: [CI Overview](https://docs.tilt.dev/ci.html)

## Практические советы

### Per-user конфигурация

```python
# local.tiltfile — добавить в .gitignore
if os.path.exists('local.tiltfile'):
    load_dynamic('local.tiltfile')
```

### Защита от продакшена

```python
# Разрешить только локальные кластеры
allow_k8s_contexts('my-dev-cluster')

# Или отключить проверку
allow_k8s_contexts(k8s_context())
```

### Группировка ресурсов в UI

```python
k8s_resource('frontend', labels=['frontend'])
k8s_resource('backend', labels=['backend'])
dc_resource('redis', labels=['data'])
```

### Ручной триггер (без автостарта)

```python
local_resource(
    'mytask',
    cmd='make mytask',
    trigger_mode=TRIGGER_MODE_MANUAL,
    auto_init=False,
)
```

### Минимальная версия

```python
version_settings(check_updates=True, constraint='>=0.23.7')
```

### Отключение snapshots

```python
disable_snapshots()
```

> Источник: [Tiltfile Snippets](https://docs.tilt.dev/snippets.html) · [Tiltfile Concepts](https://docs.tilt.dev/tiltfile_concepts.html) · [Per User Config](https://docs.tilt.dev/tiltfile_config.html)
