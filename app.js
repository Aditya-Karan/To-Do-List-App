const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set("view engine","ejs");

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', { useNewUrlParser: true })

const itemSchema=new mongoose.Schema({
    name:String
});

const listSchema=new mongoose.Schema({
    name:String,
    items:[itemSchema]

})
const List=mongoose.model("List",listSchema);

const Item = mongoose.model("Item",itemSchema);

const item1= new Item({
    name:"Welcome to your todolist!"
});

const item2=new Item({
    name:"Hit the + button to add a new item"
});

const item3=new Item({
    name:"<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

app.get("/",function(req,res){

    Item.find()
    .then(function(items){
        if(items.length===0){
            Item.insertMany(defaultItems)
            .then(function(){
                console.log("Successfully added default items")
            })
            .catch(function(err){
                console.log(err)
            });
            res.redirect("/");
        }
        else{
            res.render("lists",{listTitle: "Today" , items:items});
        }
    })
    .catch(function(err){
        console.log(err)
    });
});

app.post("/",function(req,res){
    const item=req.body.item;
    const listname=req.body.list;
    const item4= new Item({
        name:item
    });

    if(listname==="Today"){
        item4.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listname})
        .then(function(found){
            found.items.push(item4);
            found.save();
            res.redirect("/"+listname)
        })
        .catch(function(err){
            console.log(err)
        });
    }
    
});

app.post("/delete",function(req,res){
    const delId=req.body.checkbox;
    const listname=req.body.listname;
    if(listname==="Today")
    {
        Item.findByIdAndDelete(delId)
        .then(function(){
            console.log("Successfully deleted"); 
        })
        .catch(function (err) {
            console.log(err);
        });
        res.redirect("/")
    }
    else{
        List.findOneAndUpdate({name:listname},{$pull: {items: {_id:delId}}})
        .then(function(found){
        })
        .catch(function(err){
            console.log(err)
        });
        res.redirect("/"+listname)
    }
});

app.get("/:topic",function(req,res){
    const customListName=_.capitalize(req.params.topic);

    List.findOne({name:customListName})
    .then(function(foundList){
        if(!foundList){
            const list= new List({
                name:customListName,
                items:defaultItems
            });
            list.save();
            res.redirect("/"+customListName);
        }
        else{
            res.render("lists",{listTitle:foundList.name, items:foundList.items});
        }

    })
    .catch(function (err) {
        console.log(err);
    });
    
})

app.get("/works",function(req,res){
    res.render("lists",{listTitle: "Work List", items:workItem});
});

app.get("/about",function(req,res){
    res.render("about");
});

app.listen(3000,function(req,res){
    console.log("server running");
}); 