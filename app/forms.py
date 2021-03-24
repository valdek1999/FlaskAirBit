from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, TextAreaField
from wtforms.validators import DataRequired

class AddJscodeForm(FlaskForm):
        jscode = TextAreaField("Your jscode", validators=[DataRequired()])
        description = StringField('What is your jscode doing?', validators=[DataRequired()])
        submit = SubmitField('Add this code!')