## 1. Emoji Cleanup

- [x] 1.1 **linux-administration/linux-administration.md** — удалить все эмодзи. Проверено: 0 emoji осталось
- [x] 1.2 **linux-iptables/linux-iptables.md** — удалить все эмодзи. Проверено: 0 emoji осталось
- [x] 1.3 **qwen-code-cli/qwen-code-cli.md** — удалить эмодзи. Проверено: 0 emoji осталось

## 2. Structural Cleanup (TOC + Anchors)

- [x] 2.1 **c-sharp-concurrency/c-sharp-concurrency.md** — удалён ручной TOC, удалены все `<a id>`-якоря. Проверено: 0 `<a id=`, 0 `## Содержание`
- [x] 2.2 **learn-ddd/learning-ddd.md** — удалён TOC, конвертированы `<a id>`-обёртки (145 шт). Проверено: 0 `<a id=`
- [x] 2.3 **modern-distributed-tracing-core-7/modern-distributed-tracing-core-7.md** — удалён TOC, конвертированы `<a id>`-обёртки (138 шт) + 2 битых тега. Проверено: 0 `<a id=`
- [x] 2.4 **summary-begging-grpc-core-6/summary-begging-grpc-core-6.md** — удалён TOC, конвертированы `<a id>`-обёртки (84 шт). Проверено: 0 `<a id=`

## 3. Horizontal Separators Cleanup

- [x] 3.1 **linux-administration/linux-administration.md** — удалены все `---` вне frontmatter. Проверено: только строки 1,3
- [x] 3.2 **linux-iptables/linux-iptables.md** — удалены все `---` вне frontmatter. Проверено: только строки 1,3
- [x] 3.3 **qwen-code-cli/qwen-code-cli.md** — удалены все `---` вне frontmatter. Проверено: только строки 1,3
- [x] 3.4 **modern-distributed-tracing-core-7/modern-distributed-tracing-core-7.md** — удалены все `---` вне frontmatter. Проверено: только строки 1,3
- [x] 3.5 **c-sharp-concurrency/c-sharp-concurrency.md**, **learn-ddd/learning-ddd.md**, **summary-begging-grpc-core-6/summary-begging-grpc-core-6.md** — проверено: `---` только в frontmatter, удалять нечего

## 4. Final Verification

- [x] 4.1 **Сборка Jekyll** — выполнена, ошибок нет
- [x] 4.2 **Проверка `---`** — для всех 7 файлов: `---` только в YAML frontmatter (строки 1,3)
- [x] 4.3 **Визуальная проверка** — открыть каждую статью в браузере, убедиться что сайдбарное TOC отображается корректно, все секции видны, эмодзи и разделители не осталось
