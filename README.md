# FlaskAirBit
Страница с обработкой данных с утройства "ВЕГА СИ-12" на Flask + SQLAlchemy

На странице есть возможность ввести JS код, который сохранится в БД и который будет обрабатывать данные-пакета c утройства с DevEUI = 3236323166377615.

Скрипт на python подключается через API к серверу, стягивает данные по устройству с DevEUI = 3236323166377615, парсит данные от устройства по его формату.

Отображение сделать ввиде веб странички на фласке с постраничной разбивкой.

-Формат данных от устройства описан в документации (28я страница).

http://iotvega.com/content/ru/si/si12/01-%D0%92%D0%95%D0%93%D0%90%20%D0%A1%D0%98-12%20%D0%A0%D0%9F_rev%2011.pdf

-Формат данных должен разбираться с помощью JS реализации , которая запускает jscode в пайтоне.

https://github.com/sokolovs/pyrunjs

-API по get/post запросам к устройству

https://server.air-bit.eu/api/docs
