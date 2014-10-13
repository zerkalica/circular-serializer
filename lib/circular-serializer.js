var Traverse = require('traverse');
var SERIALIZER_LABEL = '@#csL';
var SERIALIZER_VALUE = '@#csV';

var defaultTypeMap = {
	Date: {
		detect: function (x) {
			return x instanceof Date;
		},
		pack: function(x) {
			return x.toJSON();
		},
		unpack: function(x) {
			return new Date(x);
		}
	}
};

function serializable(obj) {
	return !(obj === undefined || obj === true || obj === false || obj === null || typeof obj == 'number');
}

function Serializer(options) {
	if (!(this instanceof Serializer)) {
		return new Serializer(options);
	}
	this._typeMap = options.typeMap || Serializer.defaultTypeMap;
}
Serializer.defaultTypeMap = defaultTypeMap;
var proto = Serializer.prototype;

proto.deserialize = function deserialize(string) {
	var typeMap = this._typeMap;
	function deserializeMap(x) {
		if (typeof x === 'object' && x.hasOwnProperty(SERIALIZER_LABEL) && x.hasOwnProperty(SERIALIZER_VALUE)) {
			this.update(typeMap[x[SERIALIZER_LABEL]].unpack(x[SERIALIZER_VALUE]));
		}
	}

	return serializable(string) ? Traverse(JSON.parse(string)).map(deserializeMap) : string;
};

proto.serialize = function serialize(obj) {
	return serializable(obj) ? JSON.stringify(this._cleanObject(obj)) : obj;
};

proto._cleanObject = function _cleanObject(obj) {
	var data;
	if (Array.isArray(obj)) {
		data = obj.map(this._cleanObject);
	} else if (typeof obj === 'object') {
		var typeMap = this._typeMap;
		function cleanObjectMap(x) {
			if (typeof x === 'function') {
				this.update('[Function]');
			}
			if (this.circular) {
				this.update('[Circular#' + this.path + ']');
			}
			for(var label in typeMap) {
				var type = typeMap[label];
				if (type.detect(x)) {
					var data = {};
					data[SERIALIZER_VALUE] = type.pack(x);
					data[SERIALIZER_LABEL] = label;
					this.update(data);
					break;
				}
			}
		}
		data = Traverse(obj).map(cleanObjectMap);
	} else {
		data = obj;
	}

	return data;
};

module.exports = Serializer;
