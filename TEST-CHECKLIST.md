# Тест-чеклист Prism — ручная проверка

Открой https://nfactorial-ai-cup.vercel.app/

---

## 1. Dashboard (/)
- [ ] Gradient mesh фон отображается
- [ ] 3 карточки (Tweet, Thread, Quote RT) кликабельны и ведут на /create
- [ ] Pipeline визуализация с 6 шагами
- [ ] Footer виден

## 2. Create (/create)
### Базовая генерация
- [ ] Ввести тему "Why AI agents fail in production"
- [ ] Выбрать формат Tweet
- [ ] Нажать Generate
- [ ] Pipeline шаги анимируются (running → done)
- [ ] Результат появляется (~20 сек)
- [ ] Char count показывается для tweet
- [ ] Кнопка Copy работает
- [ ] Кнопка Regenerate работает

### Thread
- [ ] Выбрать Thread
- [ ] Сгенерировать — должны быть numbered tweet cards (1/5, 2/5...)
- [ ] Каждый твит показывает char count

### Quote Retweet
- [ ] Вставить URL твика или статьи
- [ ] Выбрать angle
- [ ] Сгенерировать

### File Upload
- [ ] Нажать на "Upload .txt, .md, .csv, .json"
- [ ] Загрузить .txt файл
- [ ] Файл появляется в списке с именем и кнопкой X
- [ ] Сгенерировать с прикреплённым файлом
- [ ] Проверить что контент учитывает файл

### Distribution
- [ ] После генерации нажать "Distribute"
- [ ] Кнопка показывает "Planning..." со спиннером
- [ ] Появляется Distribution Plan panel:
  - Best time
  - Format
  - Viral potential (X/10)
  - Follow-up strategy
  - Engagement hooks

## 3. Discover (/discover)
- [ ] Загружается список статей
- [ ] Видны разные источники (HN, arXiv, Substack) с цветными бейджами
- [ ] Переключение табов (All, HN, arXiv, Substack)
- [ ] Каждая карточка кликабельна → открывает оригинал
- [ ] Кнопка "Generate from this" ведёт на /create с темой

## 4. Style (/style)
- [ ] Создать профиль: имя + writing samples (текст)
- [ ] Профиль появляется в списке
- [ ] Delete работает

## 5. Memory (/memory)
- [ ] Добавить память: key = "preferred_tone", value = "provocative and direct", category = "preference"
- [ ] Появляется в списке
- [ ] Добавить ещё: key = "target_audience", value = "developers and tech founders"
- [ ] Сгенерировать контент на /create
- [ ] Проверить что стиль отражает preference

## 6. Traces (/traces)
- [ ] Показывает список трейсов
- [ ] Stats row: Total Calls, Tokens Used, Total Time
- [ ] Цветная полоска слева для каждого агента
- [ ] Клик раскрывает Input/Output
- [ ] Кнопка "Export for Submission" скачивает JSON

## 7. Мобильная адаптация
- [ ] Открыть в мобильном размере (DevTools → toggle device)
- [ ] Navigation сворачивается в hamburger меню
- [ ] Контент не ломается
- [ ] Все кнопки кликабельны

## 8. Navigation
- [ ] Все ссылки в nav работают
- [ ] Active state (золотой underline) на текущей странице
- [ ] Клик на "Prism" ведёт на /
