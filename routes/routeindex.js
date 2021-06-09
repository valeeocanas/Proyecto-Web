const { render } = require('ejs');
const express = require('express');
const fs = require('fs');
const router = express.Router();

const plants = require('../model/plants');
const posts = require('../model/posts');

router.get('/', async function(req,res){
    var plant = await plants.find();
  
    res.render('index', {plant});
  });

router.get('/monitor', async function(req,res){
  var post = await posts.find();
  var plant = await plants.find();

  res.render('monitor', {post, plant});
});

router.get('/postSim', async (req,res) =>{
  res.render('postSim',{title: 'newPost'});
});

router.post('/postSim', async (req,res) =>{
  console.log(req.body);
  var post = new posts(req.body);
  await post.save();
  res.redirect("/");
});

router.get('/newPlant', async (req,res) =>{
  res.render('newPlant',{title: 'newPlant'});
});

router.post('/newPlant', async (req,res) =>{
 
  console.log(req.body);
  var plant = new plants(req.body);
  await plant.save();
  res.redirect("/");

});

router.get('/help', (req,res) =>{
  res.render('help');
});

router.post('/help', async (req,res) =>{
  res.redirect("/");
});

router.get('/info', (req,res) =>{
  res.render('info');
});

router.get('/edit/:id', async(req,res) => {
  var plant = await plants.findById(req.params.id);
  res.render('edit', {plant});
});

router.post('/edit/:id', async(req,res) => {
  var id = req.params.id;
  await plants.update({_id: id}, req.body);
  res.redirect("/");
});

router.get('/delete/:id', async(req,res) => {
    var plant = await plants.findById(req.params.id);
    res.render('delete', {plant});
  });
  
router.post('/delete/:id', async(req,res) => {
  var id = req.params.id;
  await plants.deleteOne({_id:id})
  res.redirect("/");
});

router.get('/view/:id', async(req,res) => {
  var plant = await plants.findById(req.params.id);
  res.render('view', {plant});
});

router.get('/video', function(req, res) {
  const path = 'public/assets/1.mp4'
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    if(start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n'+start+' >= '+fileSize);
      return
    }
    
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})

module.exports = router;