var a = [{a:'d'},{a:'f'}]
for (var item of a){
    console.log(item);
    item.a = 'gg'
}

console.log(a)