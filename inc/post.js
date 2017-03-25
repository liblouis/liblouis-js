if(this) {
	this.liblouisBuilds = this.liblouisBuilds || {};

	var version;
	try {
		version = this.ccall('lou_version', 'string', [], []);
	} catch(e) {
		version = "unknown";
	}

	this.liblouisBuilds[version] = this.liblouisBuilds[version] || [];
	this.liblouisBuilds[version].push(Module);
}
