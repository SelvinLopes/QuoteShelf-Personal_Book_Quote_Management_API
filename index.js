import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";

//this is to store folders
const FOLDER_FILE = path.join(process.cwd(), "folders.json");

function getFolders() {
  if (!fs.existsSync(FOLDER_FILE)) {
    fs.writeFileSync(FOLDER_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(FOLDER_FILE, "utf-8");
  return JSON.parse(data);
}

function saveFolders(folders) {
  fs.writeFileSync(
    FOLDER_FILE,
    JSON.stringify(folders, null, 2)
  );
}

const app = express();
const port = 4000;
//port 4000 backend #2 your API responds server
//port 3000 backend #1 makes API requests client

// In-memory data store
let posts = [
  {
    id: 1,
    title: "The Rise of Decentralized Finance",
    content:
      "Decentralized Finance (DeFi) is an emerging and rapidly evolving field in the blockchain industry. It refers to the shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on Ethereum and other blockchains. With the promise of reduced dependency on the traditional banking sector, DeFi platforms offer a wide range of services, from lending and borrowing to insurance and trading.",
    author: "Alex Thompson",
    date: "2025-12-16T10:00:00Z",
  },
  {
    id: 2,
    title: "The Impact of Artificial Intelligence on Modern Businesses",
    content:
      "Artificial Intelligence (AI) is no longer a concept of the future. It's very much a part of our present, reshaping industries and enhancing the capabilities of existing systems. From automating routine tasks to offering intelligent insights, AI is proving to be a boon for businesses. With advancements in machine learning and deep learning, businesses can now address previously insurmountable problems and tap into new opportunities.",
    author: "Mia Williams",
    date: "2025-12-17T14:30:00Z",
  },
  {
    id: 3,
    title: "Sustainable Living: Tips for an Eco-Friendly Lifestyle",
    content:
      "Sustainability is more than just a buzzword; it's a way of life. As the effects of climate change become more pronounced, there's a growing realization about the need to live sustainably. From reducing waste and conserving energy to supporting eco-friendly products, there are numerous ways we can make our daily lives more environmentally friendly. This post will explore practical tips and habits that can make a significant difference.",
    author: "Samuel Green",
    date: "2025-12-17T09:15:00Z",
  },
];

let lastId = 3;


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Write your code here//

//CHALLENGE 1: GET All posts
app.get("/posts" , ( req , res ) => {
  console.log(posts);
  res.json(posts);
});

//Challenge : get all folders
app.get("/folders", (req, res) => {
  const folders = getFolders();
  res.json(folders);
});

//Challenge: inside folder
app.get("/folder/:id" , ( req , res ) => {
  console.log(folders);
  res.json(folders);
});

//CHALLENGE 2: GET a specific post by id
app.get("/posts/:id" , ( req , res ) => {
  const idSpecify = parseInt(req.params.id);
  const specificPost = posts.find((post) => post.id === idSpecify);
  res.json(specificPost);
});

//CHALLENGE 3: POST a new post
app.post("/posts" , (req , res) => {
  const newPost = {
    id: ++lastId,
    title : req.body.title,
    content : req.body.content,
    author : req.body.author,
    date : new Date(),
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

//Challenge : when u create a new folder
app.post("/folder", (req, res) => {
  const { folderName } = req.body;

  const folders = getFolders();

  const newFolder = {
    id: Date.now(),
    name: folderName,
    posts: [],
    author: req.body.author
  };

  folders.push(newFolder);
  saveFolders(folders);

  res.status(201).json(newFolder);
});

//Challenge : POST a new post INSIDE a folder
app.post("/folder/:id/posts", (req, res) => {
  const folderId = parseInt(req.params.id);

  const folders = getFolders();
  const folder = folders.find(f => f.id === folderId);

  if (!folder) {
    return res.status(404).json({ error: "Folder not found" });
  }

  const newPost = {
    id: Date.now(),
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    date: new Date()
  };

  folder.posts.push(newPost);   // 🔑 MUST BE THIS
  saveFolders(folders);

  res.status(201).json(newPost);
});

//Challenge : DELETE a post INSIDE a folder
app.delete("/folder/:folderId/posts/:postId", (req, res) => {
  const folderId = parseInt(req.params.folderId);
  const postId = parseInt(req.params.postId);

  const folders = getFolders();
  const folder = folders.find(f => f.id === folderId);

  if (!folder) {
    return res.status(404).json({ error: "Folder not found" });
  }

  const postIndex = folder.posts.findIndex(p => p.id === postId);

  if (postIndex === -1) {
    return res.status(404).json({ error: "Post not found in folder" });
  }

  folder.posts.splice(postIndex, 1);
  saveFolders(folders);

  res.sendStatus(200);
});

//Challenge : UPDATE a post INSIDE a folder
app.patch("/folder/:folderId/posts/:postId", (req, res) => {
  const folderId = parseInt(req.params.folderId);
  const postId = parseInt(req.params.postId);

  const folders = getFolders();
  const folder = folders.find(f => f.id === folderId);

  if (!folder) {
    return res.status(404).json({ error: "Folder not found" });
  }

  const post = folder.posts.find(p => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: "Post not found in folder" });
  }

  post.title = req.body.title;
  post.content = req.body.content;
  post.author = req.body.author;
  post.date = new Date();

  saveFolders(folders);

  res.json(post);
});


//CHALLENGE 4: PATCH a post when you just want to update one parameter
app.patch("/posts/:id", (req, res) => {
  const idEdit = parseInt(req.params.id);
  const postEdit = posts.find((post) => post.id === idEdit);
  if (!postEdit) {
    return res.status(404).json({ message: "Post not found" });
  }
  const newPostEdit = {
    id : idEdit ,
    title: req.body.title || postEdit.title,
    content : req.body.content || postEdit.content,
    author : req.body.author || postEdit.author,
    date : req.body.date || postEdit.date,
  };
  const searchIndex = posts.findIndex((joke) => joke.id === idEdit);
  posts[searchIndex] = newPostEdit;
  res.json(newPostEdit);
});

//CHALLENGE 5: DELETE a specific post by providing the post id.
app.delete( "/posts/:id" , ( req , res ) => {
  const delId = parseInt(req.params.id);
  const delsearchIndex = posts.findIndex((joke) => joke.id === delId);
  if (delsearchIndex > -1) {
    posts.splice(delsearchIndex, 1);
    res.sendStatus(200);
  } else {
    res
      .status(404)
      .json({ error: "Post not found" });
  }
});

//Challenge : Delete a specific folder
app.delete("/folder/delete/:id", (req, res) => {
  const delId = parseInt(req.params.id);

  const folders = getFolders();
  const index = folders.findIndex(f => f.id === delId);

  if (index === -1) {
    return res.status(404).json({ error: "Folder not found" });
  }

  folders.splice(index, 1);
  saveFolders(folders);

  res.sendStatus(200);
});



app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});


//selvin lopes for REST API signing off...