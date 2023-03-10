
1. [https://babeljs.io/docs/en/babel-types](https://babeljs.io/docs/en/babel-types) - документация для написания функций трансформации
2. [https://github.com/isaacs/node-glob](https://github.com/isaacs/node-glob) - используется для парсинга параметров `--path`, `--transform`
3. В файле `index.ts` содержится основная логика утилиты - миграций/трансформаций
4. В директории `/transform` лежат функции трансформации кода, файл `/transform/example.ts` содержит несколько функций для демонстрации принципа их написания
5. Предусмотрены параметры командной строки: 
6. `—path` - путь до нужной директории с файлами или конкретного файла, который будет трансформироваться, включает в себя возможность написания регулярного выражения, формат `--path`="[pattern](https://github.com/isaacs/node-glob#glob-primer)"
7. `—transform` - путь до директории с файлом трансформации, в котором объявлена функция, реализующая интерфейс `TransformFunction`, включает в себя возможность написания регулярного выражения, формат: `--transform`="[pattern](https://github.com/isaacs/node-glob#glob-primer)"
8. Пример использования утилиты: `ts-node index.ts --path="**/*index.ts" --transform="./transform/example.ts"`
