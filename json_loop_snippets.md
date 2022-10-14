filter
```
let lMarkerArray = complaintJson
  .filter(complaint => complaint.category == "pothole")
  .map(complaint => L.marker([complaint.lat, complaint.long]));
```

```
var obj = JSON.parse(yourJsonString);

//for each object in the "Mensaplan" array
for(var i = 0; i < obj.Mensaplan.length; ++i) {

    //for each key in the object
    for(var key in obj.Mensaplan[i]) {

        var day = obj.Mensaplan[i][key];

        //here key is the day's name, and day is the data...
    }
}
```


first parse it using JSON

`var json = JSON.parse(jsonString)`

then is just a javascript object.. you should use..

```
Object.keys(json).forEach(function (key) {
    json[key];  
});
```
if you use for in you need to check that the object has that property and is not one of their parents (if (json.hasOwnProperty) { //code here })
using Object.keys you don't need to do that, since grabs only the keys the object owns.

```
var p = {
    "p1": "value1",
    "p2": "value2",
    "p3": "value3"
};

for (var key in p) {
    if (p.hasOwnProperty(key)) {
        console.log(key + " -> " + p[key]);
    }
}
```



Use Object.keys() to get keys array and use forEach() to iterate over them.

```
var data = {
  "VERSION": "2006-10-27.a",
  "JOBNAME": "EXEC_",
  "JOBHOST": "Test",
  "LSFQUEUE": "45",
  "LSFLIMIT": "2006-10-27",
  "NEWUSER": "3",
  "NEWGROUP": "2",
  "NEWMODUS": "640"
};

Object.keys(data).forEach(function(key) {
  console.log('Key : ' + key + ', Value : ' + data[key])
})
```

