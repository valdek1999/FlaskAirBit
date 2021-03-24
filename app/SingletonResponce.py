import requests


class SingletonResponse:
    data_list = None

    def __new__(cls, restart):
        if cls.data_list is None or restart:
            response = requests.get('https://server.air-bit.eu/api/data/?dev_eui=3236323166377615',
                                    auth=('i.irhin@yandex.ru', 'norw3YHLco1bpoS64sTEEHXge'))
            json = response.json()
            cls.data_list = json[0]['data']
        return cls.data_list
