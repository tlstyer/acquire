#!/usr/bin/env python3.4m

import glob
import logs2db
import orm
import ormlookup
import os
import sqlalchemy.orm
import statsgen
import subprocess
import time


def run_logs2db():
    session = sqlalchemy.orm.sessionmaker(bind=orm.engine)(autoflush=False)
    try:
        lookup = ormlookup.Lookup(session)
        logs2db_obj = logs2db.Logs2DB(session, lookup)

        kv_last_filename = lookup.get_key_value('cron last filename')
        last_filename = 0 if kv_last_filename.value is None else int(kv_last_filename.value)
        kv_last_offset = lookup.get_key_value('cron last offset')
        last_offset = 0 if kv_last_offset.value is None else int(kv_last_offset.value)

        filenames = []
        for filename in os.listdir('logs_py'):
            filename = int(filename)
            if filename >= last_filename:
                filenames.append(filename)
        filenames.sort()

        filename = 0
        offset = 0
        for filename in filenames:
            offset = last_offset if filename == last_filename else 0
            with open('logs_py/' + str(filename), 'r') as f:
                if offset:
                    f.seek(offset)
                offset = logs2db_obj.process_logs(f, filename)

        kv_last_filename.value = filename
        kv_last_offset.value = offset

        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()


def run_statsgen():
    session = sqlalchemy.orm.sessionmaker(bind=orm.engine)(autoflush=False)
    try:
        lookup = ormlookup.Lookup(session)
        statsgen_obj = statsgen.StatsGen(session, lookup, 'stats_temp')
        statsgen_obj.do_work()
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()


def gzip_and_release_stats_files():
    filenames = glob.glob('stats_temp/*.json')
    if filenames:
        command = ['gzip', '-knf9']
        command.extend(filenames)
        subprocess.call(command)

        command = ['mv']
        command.extend(filenames)
        command.extend(x + '.gz' for x in filenames)
        command.append('web/stats')
        subprocess.call(command)


def main():
    while True:
        run_logs2db()
        run_statsgen()
        gzip_and_release_stats_files()

        time.sleep(60)


if __name__ == '__main__':
    main()
