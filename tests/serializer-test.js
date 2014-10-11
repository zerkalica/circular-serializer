var expect   = require('./test-helpers').expect;
var serializer = require('../lib/circular-serializer');

describe('serializer', function () {
  function MyType(name) {
    this.name = name;
  };
  serializer.typeMap.MyType = {
    detect: function (x) {
      return x instanceof MyType;
    },
    pack: function(x) {
      return {name: x.name};
    },
    unpack: function(x) {
      return new MyType(x.name);
    }
  };

  var testObject = {
    k: [1, 2, 'rrr'],
    b: 'test',
    my: new MyType('test'),
    c: new Date('2014-10-11T11:51:56.822Z')
  };
  testObject.d = testObject;

  var serializedTestObject = '{\"k\":[1,2,\"rrr\"],\"b\":\"test\",\"my\":{\"@#csV\":{\"name\":\"test\"},\"@#csL\":\"MyType\"},\"c\":{\"@#csV\":\"2014-10-11T11:51:56.822Z\",\"@#csL\":\"Date\"},\"d\":\"[Circular#d]\"}';

  var testArray = [1, 2, 'test', {a: 1}];
  var serializedTestArray = '[1,2,\"test\",{\"a\":1}]';

  describe('#serialize', function () {
    var serialize = serializer.serialize;

    it('should not serialize simple types', function () {
      expect(serialize(null)).to.be.equal(null);
      expect(serialize(false)).to.be.equal(false);
      expect(serialize(true)).to.be.equal(true);
      expect(serialize(123.33)).to.be.equal(123.33);
      expect(serialize(undefined)).to.be.equal(undefined);
    });

    it('should serialize string', function () {
      var ts = 'test-string';
      expect(serialize(ts)).to.be.equal('"' + ts + '"');
    });

    it('should serialize object', function () {
      expect(serialize(testObject)).to.be.equal(serializedTestObject);
    });

    it('should serialize array', function () {
      expect(serialize(testArray)).to.be.equal(serializedTestArray);
    });
  });

  describe('#deserialize', function () {
    var deserialize = serializer.deserialize;
    it('should not deserialize simple types', function () {
      expect(deserialize(null)).to.be.equal(null);
      expect(deserialize(false)).to.be.equal(false);
      expect(deserialize(true)).to.be.equal(true);
      expect(deserialize(123.33)).to.be.equal(123.33);
      expect(deserialize(undefined)).to.be.equal(undefined);
    });

    it('should deserialize object', function () {
      var to = Object.create(testObject);
      to.d = '[Circular#d]';
      expect(deserialize(serializedTestObject)).to.be.deep.equal(to);
    });
  });
});
