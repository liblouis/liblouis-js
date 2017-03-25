cd "$(dirname "$0")/../"
python -m SimpleHTTPServer 8080 &
phantomjs ./testrunner/phantom.js
