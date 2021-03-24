from runjs import *

def init_js(js_code):
    js = JSRunWrapper.factory(
        backend='nodejs',
        js_code=js_code
    )
    return js


