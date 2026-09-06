## 1. Создание cheatsheet

- [x] 1.1 Создать `tilt/tilt.md` с Jekyll front matter (`layout: default`) и разделом «Что такое Tilt» с описанием инструмента и ссылкой на docs.tilt.dev и controlloop.html
- [x] 1.2 Добавить раздел «Установка» с командами для Linux и ссылкой на install.html
- [x] 1.3 Добавить раздел «Базовый сценарий» с минимальным Tiltfile (k8s_yaml + docker_build + k8s_resource), запуском `tilt up` и ссылками на tiltfile_authoring.html и tutorial
- [x] 1.4 Добавить раздел «Tiltfile API» с таблицей ключевых функций (docker_build, k8s_yaml, k8s_resource, docker_compose, local_resource, custom_build, helm, kustomize, local) и ссылкой на api.html
- [x] 1.5 Добавить раздел «CLI-команды» с таблицей команд (tilt up, tilt ci, tilt down, tilt logs, tilt args, tilt trigger, tilt version, tilt doctor) и ссылкой на CLI reference
- [x] 1.6 Добавить раздел «Live Update» с описанием шагов sync/run/fall_back_on и ссылкой на live_update_reference.html
- [x] 1.7 Добавить раздел «CI» с описанием `tilt ci` и ссылкой на ci.html
- [x] 1.8 Добавить раздел «Практические советы» со сниппетами (local.tiltfile, manual trigger, resource groups, allow_k8s_contexts, version_settings) и ссылкой на snippets.html

## 2. Адаптация под техстек

- [x] 2.1 Заменить generic-примеры в `tilt/tilt.md` на .NET Core и TypeScript (образы, Tiltfile, docker_build, Live Update, CI)
- [x] 2.2 В разделе «Базовый сценарий» привести пример Tiltfile для .NET Core (aspnet) + TypeScript (node) сервисов
- [x] 2.3 В разделе «Tiltfile API» таблицу примеров привести к .NET Core + TypeScript
- [x] 2.4 В разделе «Live Update» пример обновления для .NET Core (dotnet watch) и TypeScript (ts-node/nodemon)

## 3. Проверка

- [x] 3.1 Проверить, что файл `tilt/tilt.md` создан, все ссылки валидны, код-блоки отформатированы корректно
