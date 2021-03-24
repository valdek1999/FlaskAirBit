from app import db


class Jscode(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    jscode = db.Column(db.Text(), index = True, unique = True)
    description = db.Column(db.Text(), index=True, unique=True)

    def __init__(self, jscode, description):
        self.jscode = jscode
        self.description = description

    def __repr__(self):# представление объекта в строчном виде
        return '<{}>'.format(self.id)