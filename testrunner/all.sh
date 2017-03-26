cd "$(dirname "$0")"
./browser.sh
rc=$?;
node ./main.js
if [ $? != 0 ]; then rc=1; fi
exit $rc;
