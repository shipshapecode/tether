[![Build Status](https://travis-ci.org/wearefractal/vinyl.png?branch=master)](https://travis-ci.org/wearefractal/vinyl)

[![NPM version](https://badge.fury.io/js/vinyl.png)](http://badge.fury.io/js/vinyl)

## Information

<table>
<tr> 
<td>Package</td><td>vinyl</td>
</tr>
<tr>
<td>Description</td>
<td>A virtual file format</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.9</td>
</tr>
</table>

## File

```javascript
var File = require('vinyl');

var coffeeFile = new File({
  cwd: "/",
  base: "/test/",
  path: "/test/file.coffee"
  contents: new Buffer("test = 123")
});
```

### constructor(options)

#### options.cwd

Type: `String`  
Default: `process.cwd()`

#### options.base

Used for relative pathing. Typically where a glob starts.

Type: `String`  
Default: `options.cwd`

#### options.path

Full path to the file.

Type: `String`  
Default: `null`

#### options.stat

The result of an fs.stat call. See [fs.Stats](http://nodejs.org/api/fs.html#fs_class_fs_stats) for more information.

Type: `fs.Stats`  
Default: `null`

#### options.contents

File contents.

Type: `Buffer, Stream, or null`  
Default: `null`

### isBuffer()

Returns true if file.contents is a Buffer.

### isStream()

Returns true if file.contents is a Stream.

### isNull()

Returns true if file.contents is null.

### clone()

Returns a new File object with all attributes cloned.

### pipe(stream[, opt])

If file.contents is a Buffer, it will write it to the stream.

If file.contents is a Stream, it will pipe it to the stream.

If file.contents is null, it will do nothing.

If opt.end is true, the destination stream will not be ended (same as node core).

Returns the stream.

### inspect()

Returns a pretty String interpretation of the File. Useful for console.log.

### relative

Returns path.relative for the file base and file path.

Example:

```javascript
var file = new File({
  cwd: "/",
  base: "/test/",
  path: "/test/file.coffee"
});

console.log(file.relative); // file.coffee
```


## LICENSE

(MIT License)

Copyright (c) 2013 Fractal <contact@wearefractal.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
