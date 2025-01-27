const path = require('path');
const express = require('express');
const app = express();
const port = 3000;




//クラアントからのアクセスを許可するディレクトリ
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/color', (req, res) => {
  res.sendFile(path.join(__dirname,"public" ,"color",'index_color.html')); 
});

app.get('/color/layers', (req, res) => {
  //console.log(req.query); // クエリパラメータをログに出力
  res.sendFile(path.join(__dirname, "public","color","layers",'index_color_layers.html')); 
});

app.listen(port,async () => {
  console.log('Server running at http://localhost:3000/');
  const open = (await import('open')).default;
  open(`http://localhost:${port}/`);
});


