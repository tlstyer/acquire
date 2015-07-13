import glob
import gzip
import re

_log_type_to_log_file_filenames = {}
re_timestamp_in_path = re.compile(r'([^/]*?)(\.gz)?$')


def get_log_file_filenames(log_type, begin=None, end=None):
    global _log_type_to_log_file_filenames

    if log_type in _log_type_to_log_file_filenames:
        timestamp_and_filename = _log_type_to_log_file_filenames[log_type]
    else:
        filenames = glob.glob('/home/tim/server_mirror-archive/acquire.tlstyer.com/live/logs_' + log_type + '/*')
        filenames.extend(glob.glob('/home/tim/server_mirror/acquire.tlstyer.com/live/logs_' + log_type + '/*'))

        timestamp_and_filename = [(int(re_timestamp_in_path.search(filename).group(1)), filename) for filename in filenames]

        _log_type_to_log_file_filenames[log_type] = timestamp_and_filename

    if begin:
        timestamp_and_filename = filter(lambda x: x[0] >= begin, timestamp_and_filename)

    if end:
        timestamp_and_filename = filter(lambda x: x[0] <= end, timestamp_and_filename)

    return sorted(timestamp_and_filename)


re_gzip_filename = re.compile(r'.*\.gz$')


def open_possibly_gzipped_file(filename):
    if re_gzip_filename.match(filename):
        f = gzip.open(filename, 'rt')
    else:
        f = open(filename)
    return f
