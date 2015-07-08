import glob
import gzip
import re

re_timestamp_in_path = re.compile(r'([^/]*?)(\.gz)?$')


def get_log_file_paths(log_type, begin=None, end=None):
    paths = glob.glob('/home/tim/server_mirror-archive/acquire.tlstyer.com/live/logs_' + log_type + '/*')
    paths.extend(glob.glob('/home/tim/server_mirror/acquire.tlstyer.com/live/logs_' + log_type + '/*'))

    timestamp_and_path = [(int(re_timestamp_in_path.search(path).group(1)), path) for path in paths]

    if begin:
        timestamp_and_path = filter(lambda x: x[0] >= begin, timestamp_and_path)

    if end:
        timestamp_and_path = filter(lambda x: x[0] <= end, timestamp_and_path)

    return sorted(timestamp_and_path)


re_gzip_filename = re.compile(r'.*\.gz$')


def open_possibly_gzipped_file(filename):
    if re_gzip_filename.match(filename):
        f = gzip.open(filename, 'rt')
    else:
        f = open(filename)
    return f
