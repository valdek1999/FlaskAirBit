from sqlalchemy.orm import scoped_session, sessionmaker
from app import app, engine
from flask import render_template, flash, redirect, url_for, request
from app.forms import AddJscodeForm
from app import models
from app import js_wrapper
from app import SingletonResponce
import base64


@app.route('/')
@app.route('/index')
def index():
    user = {'username': 'Ilya'}
    title = 'Page with list of Jscode'
    db_session = scoped_session(sessionmaker(autocommit=False,
                                             autoflush=False,
                                             bind=engine))
    js_obj = db_session.query(models.Jscode).first()
    if not js_obj:
        return render_template('index.html', title=title, user=user)
    jscode = {'id': str(js_obj.id), 'jscode': js_obj.jscode, 'description': js_obj.description}
    db_session.close()
    return render_template('index.html', title=title, user=user, jscode=jscode)


@app.route('/add_jscode', methods=['GET', 'POST'])
def add_jscode():
    form = AddJscodeForm()
    title = 'Page for adding code'
    if form.validate_on_submit():
        id = 1
        text_code = form.jscode.data
        description = form.description.data
        db_session = scoped_session(sessionmaker(autocommit=False,
                                                 autoflush=False,
                                                 bind=engine))
        js_obj = db_session.query(models.Jscode).first()
        if js_obj:
            db_session.query(models.Jscode).delete()
            db_session.commit()
        temp = models.Jscode(str(text_code), str(description))
        db_session.add(temp)
        db_session.commit()
        db_session.close()
        flash('A new jscode has been added on site id {}, description {} '.format(str(id), form.description))
        return redirect(url_for('index'))
    return render_template('add_jscode.html', title=title, form=form)


@app.route('/jscode_pick/<int:js_id>')
def jscode_pick(js_id):
    db_session = scoped_session(sessionmaker(autocommit=False,
                                             autoflush=False,
                                             bind=engine))
    jscode = db_session.query(models.Jscode).first().jscode
    return render_template('jscode_pick.html', jscode=jscode)


@app.route('/data_list', methods=['GET'])
def data_list():
    title = "Информация о СИ-12 устройстве"
    page = int(request.args.get('page'))
    if page == 1:
        data_list = SingletonResponce.SingletonResponse(True)
    else:
        data_list = SingletonResponce.SingletonResponse(False)
    list_id_packet = []
    for temp in data_list:
        id = base64.b64decode(temp['data'])[0]
        list_id_packet.append(id)
    return render_template('data_list.html', title=title, data_list=data_list, len=len(data_list),
                           list_id_packet=list_id_packet, page=page)


@app.route('/data_list/data/<int:id>')
def data(id):
    db_session = scoped_session(sessionmaker(autocommit=False,
                                             autoflush=False,
                                             bind=engine))
    record = db_session.query(models.Jscode).first()
    try:
        if not record:
            raise Exception("Отсутсвует код в базе данных , добавьте его")
        code = db_session.query(models.Jscode).first().jscode
        db_session.commit()
        js = js_wrapper.init_js(code)
        data_list = SingletonResponce.SingletonResponse(False)

        data_current = base64.b64decode(data_list[id]['data'])
        js.set_global_var('Base64Binary', list(data_current))
        db_session.close()
        if (code):
            data_parse = js.run(func='parser_data', fargs=[data_list[id]['fport']])
            return render_template('data.html', data_parse = data_parse)
        else:
            raise Exception("Отсутсвует код для обработки выбранного пакета")
    except Exception as e:
        return "Проблема с запуском кода.\n{}".format(e)
