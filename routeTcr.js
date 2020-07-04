var express=require("express");

var app=express();


app.use('/', express.static(__dirname));

app.get('/home',function(req,res){
    res.sendFile(__dirname+"/templates/Dashboard.html");
});
app.get('/purchase',function(req,res){
    res.sendFile(__dirname+"/templates/purchaseTokens.html");
});
app.get('/approve',function(req,res){
    res.sendFile(__dirname+"/templates/Approve.html");
});
app.get('/sendAppl',function(req,res){
    res.sendFile(__dirname+"/templates/sendApplication.html");
});
app.get('/votechg',function(req,res){
    res.sendFile(__dirname+"/templates/votec.html");
});

app.listen(3000);