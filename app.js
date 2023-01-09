//requiring the required modules
const express=require("express");
const bodyParser=require("body-parser");
const _=require("lodash");
const app=express();
const mongoose=require("mongoose");
require('dotenv').config();
// let items=[];
app.set('view engine', 'ejs');
// let workItems=[];
app.use(bodyParser.urlencoded({extended:true}));
//making files static so that css and other ifles are accessible
app.use(express.static("public"));
mongoose.set('strictQuery',false);
//connecting to the database
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zkorwkt.${process.env.DB_HOST}/todolistDB`,{useNewUrlParser:true});
//creating Schema
const itemSchema=new mongoose.Schema({
name:String
});
//another way of creating schema
const listSchema={
name:String,
items:[itemSchema]
};
//creating model
const Item=mongoose.model("Item",itemSchema);
const List=mongoose.model("List",listSchema);
//creating items
const item1=new Item({name:"Add the Items in the list you want to do today and it will stay here till you delete it"});
const item3=new Item({name:"Hope you Like it !!"});
const item2=new Item({name:"Created with ❤️ by Sunny Das"});
const defaultItems=[item1,item2,item3];
//routing 
app.get("/",function(req,res){

Item.find({},(err,item)=>{
   if(item.length==0)
   {
      Item.insertMany(defaultItems,(err)=>{
         if(err)
         console.log(err);
         else
         console.log("Successfully added to databse");
      });
      res.redirect("/");
   }
   else{
      res.render("list",{listTitle:"Today", newListItems: item});
   }
            
         
   });
// Item.deleteMany({name:"Watch Cricket MAtch"},(err)=>{
//    if(!err)
//    console.log("Deleted Success");
// });
});
app.post("/",function(req,res){
//checking from which list the post has occurred
const  itemName =req.body.newitem;
const listName=req.body.list;
const newItem=new Item({name:itemName});
if(listName==="Today")
{//for home list
   newItem.save();
   res.redirect("/");
}
else{//for custom lists
 List.findOne({name:listName},function(err,foundList){
   foundList.items.push(newItem);
   foundList.save();
   res.redirect("/"+listName);

 });  
}



});

app.get("/:customListName",function(req,res){
   //routing to custom lists page using route parameters
const customList=_.capitalize(req.params.customListName);
//cheking the collection and find its data
if(customList!=="Favicon.ico"){
List.findOne({name:customList},function(err,foundList){
  if(!err)
  {
   if(!foundList)
   {
   //create a new custom list
   const list=new List({
      name:customList,
      items:defaultItems
     });
     list.save();
     res.redirect("/"+customList);
   }
   else
   {
//show the found list
      res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
   }
  }
});
}
});

app.post("/delete",function(req,res){
   const checkedItemId=req.body.checkbox;
   const listName=req.body.listName;
   if(listName==="Today")
   {
      Item.findByIdAndRemove(checkedItemId,(err)=>{
         //if we dont pass callback function to findByIdAndREmove then it wont be exexuted it will only find the item but dont delete it so passing callback function is neccessity
         res.redirect("/");
        //  if(err)
        //  console.log(err);
        //  else
        //  console.log("Successfully deleted checked item");
        });
   }
   else{
      //pull operator removes from an existing array all instances of a value or vallues that match a specified condition syntax:{$pull:{field1:condition or value,fiel2:condition or value ,.....}}
      //Mongoose findOneAndUpdate is function  that find one item on basis of condtin specified then update it as values passed
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
         if(!err)
        {
         res.redirect("/"+listName);
        } 
      });
   }
 
});
app.get("/about", function(req, res){
   res.render("about");
 });
 
//starting the server 
app.listen( process.env.PORT || 4444,function()
{
console.log("server started");
});
