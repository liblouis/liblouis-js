./browser.sh
rc=$?;
node ./testrunner/main.js
if [[ $? != 0 ]]; then rc=1; fi
exit $rc;
