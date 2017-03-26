echo "[INFO] EXECUTING TESTS IN BROWSER ENVIRONMENT (PHANTOMJS)"
cd "$(dirname "$0")/../"
python -m SimpleHTTPServer 8080 &
rc=$?;
echo "[INFO] WAITING A FEW SECONDS UNTIL HTTP SERVER BOOTS..."
sleep 5
phantomjs ./testrunner/phantom.js build-no-tables-utf16
if [ $? != 0 ]; then rc=1; fi
phantomjs ./testrunner/phantom.js build-no-tables-utf32
if [ $? != 0 ]; then rc=1; fi
phantomjs ./testrunner/phantom.js build-tables-embeded-root-utf16
if [ $? != 0 ]; then rc=1; fi
phantomjs ./testrunner/phantom.js build-tables-embeded-root-utf32
if [ $? != 0 ]; then rc=1; fi

if [ $rc = 0 ]; then
	echo "[INFO] ALL BROWSER TESTS PASSED!"
fi
exit $rc;

# TODO: should clause python http server here...
