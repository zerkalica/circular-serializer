# Circular serializer

Circular safe, extensible, Date support

## Usage

### Simple

``` javascript
var cs = require('circular-serializer')();

var testObject = {
  k: [1, 2, 'rrr'],
  b: 'test',
  c: new Date('2014-10-11T11:51:56.822Z')
};

testObject.d = testObject; // circular

var string = cs.serialize(testObject);

console.log(cs.deserialize(string));
/*
{ k: [ 1, 2, 'rrr' ],
  b: 'test',
  c: Sat Oct 11 2014 15:51:56 GMT+0400 (MSK),
  d: '[Circular#d]' }
*/
```

### Custom types

``` javascript
var csf = require('circular-serializer');

function MyType(name) {
  this.name = name;
};

var typeMap = Object.create(csf.defaultTypeMap);

typeMap.MyType = {
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
var cs = csf({typeMap: typeMap});

var testObject = {
  k: [1, 2, 'rrr'],
  b: 'test',
  my: new MyType('test'),
  c: new Date('2014-10-11T11:51:56.822Z')
};

var string = cs.serialize(testObject);

console.log(cs.deserialize(string));
/*
{ k: [ 1, 2, 'rrr' ],
  b: 'test',
  my: { name: 'test' },
  c: Sat Oct 11 2014 15:51:56 GMT+0400 (MSK) }
*/

```
