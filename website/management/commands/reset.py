import os
import shutil
import sys
import json
import importlib
import traceback
from pathlib import Path
from django.core.management import call_command
from django.core.management.base import BaseCommand


def connect_mysql():
    try:
        from MySQLdb import connect
        return connect
    except:
        a = 1


def connect_postgresql():
    try:
        from psycopg2 import connect
        return connect
    except:
        a = 1


class Command(BaseCommand):
    help = 'setting up db i.e. create db or drop db for dev purpose'
    settings_dir = os.path.dirname(__file__)
    str = 'website/management/commands'
    base_directory = ''
    if str in settings_dir:
        base_directory = settings_dir.replace(str, '')
    else:
        str = 'website\\management\\commands'
        base_directory = settings_dir.replace(str, '')

    def create_db_n_migrations(self, root_path, recreate):
        database_info = {}
        res = 'Unknown'
        config_path = '{}config.json'
        config_path = config_path.format(self.base_directory)
        if not os.path.exists(config_path):
            example_config_path = '{}example.config.json'
            example_config_path = example_config_path.format(self.base_directory)
            if not os.path.exists(example_config_path):
                return 'no config exists'
            shutil.copyfile(example_config_path, config_path)

        config_info = False
        with open(config_path, 'r') as config:
            config_info = json.load(config)

        active_db = False
        if config_info:
            active_db = config_info.get('active_db')
            if active_db:
                db_config = config_info.get(active_db)
                if db_config:
                    database_info = config_info[active_db]

        db_engine = database_info['ENGINE']
        db_connection = None
        if db_engine.endswith('sqlite3'):
            db_path = Path.as_posix(root_path) + '/db.sqlite3'
            if os.path.exists(db_path):
                os.remove(db_path)
            return 'created'
        else:
            if db_engine.endswith('mysql'):
                db_connection = connect_mysql()
            if db_engine.endswith('postgresql'):
                db_connection = connect_mysql()

            if db_connection:
                db = db_connection(host="localhost", user=database_info['USER'], passwd=database_info['PASSWORD'])
                c = db.cursor()
                try:
                    c.execute('create database '+database_info['NAME'])
                    importlib.import_module('del')
                    db.close()
                    return 'created'
                except:
                    if recreate:
                        c.execute('drop database if exists ' + database_info['NAME'])
                        c.execute('create database ' + database_info['NAME'])
                        importlib.import_module('del')
                        db.close()
                        return 'created'
                    else:
                        db.close()
                        return 'already exists'
            else:
                return ' failed to connect'

    def add_arguments(self, parser):
        parser.add_argument('-hard', '--hard',
                            action='store_true',
                            help='drop database if exists and create new one')

    def handle(self, *args, **kwargs):
        try:
            root_path = os.path.dirname(__file__)  # ./website/management/commands
            root_path = os.path.dirname(root_path)  # ./website/management
            root_path = os.path.dirname(root_path)  # ./website
            root_path = os.path.dirname(root_path)  # ./

            recreate = kwargs.get('hard')
            res = self.create_db_n_migrations(root_path, recreate)
            if res == 'created':
                if recreate:
                    call_command('makemigrations')
                    call_command('migrate')
                    # Pinter@rt5
                    fixture_path = root_path + '/fixtures/data.json'
                    if os.path.isfile(fixture_path):
                        call_command('loaddata', fixture_path)
                    print('Created successfully')
                else:
                    print('Created successfully')
            elif res == 'already exists':
                print('Already created')
            else:
                print('Failed because ' + res)
        except:
            eg = traceback.format_exception(*sys.exc_info())
            error_message = ''
            cnt = 0
            for er in eg:
                cnt += 1
                if not 'lib/python' in er and not 'lib\site-packages' in er:
                    error_message += " " + er
            print('Error ' + error_message)
